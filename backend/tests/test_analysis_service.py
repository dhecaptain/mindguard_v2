"""Tests for the analysis service boundary (Brief §7, §9.3).

Verifies that consent enforcement, payload validation, audit, and alert
side-effects are owned by ``analysis_service.run_consented_student_analysis``
and not scattered through routes.
"""

from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

from backend.services import analysis_service, consent_service


def _seed_active(db) -> dict:
    counsellor = db.create_user("counsellor@school.edu", "Counsellor", "x", role_type="counsellor")
    student = db.create_user("student@school.edu", "Student", "x", role_type="student")
    consent = db.create_consent(student["id"], counsellor["id"], "student@school.edu", "student", ["reddit"])
    updated = consent_service.dispatch_consent(consent["id"], counsellor["id"])
    consent_service.accept_consent(updated["id"], "Student", "1.2.3.4")
    return {"counsellor": counsellor, "student": student, "consent": updated}


def _long_post(score: float, days_ago: float = 0.0) -> dict:
    text = " ".join(["word"] * 30)  # >= 20 tokens: no short-text penalty
    date = datetime.now(timezone.utc).isoformat()
    if days_ago:
        from datetime import timedelta
        date = (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()
    return {"risk_score": score, "date": date, "text": text, "platform": "reddit"}


def _run(db, student, actor, posts, platform="reddit"):
    return analysis_service.run_consented_student_analysis(
        student_id=student["id"], posts=posts, platform=platform,
        actor=actor, ip="127.0.0.1",
    )


def test_blocks_without_active_consent(db):
    counsellor = db.create_user("c@school.edu", "C", "x", role_type="counsellor")
    student = db.create_user("s@school.edu", "S", "x", role_type="student")
    with pytest.raises(HTTPException) as exc:
        _run(db, student, counsellor, [_long_post(0.3)])
    assert exc.value.status_code == 403


def test_blocks_with_revoked_consent(db):
    s = _seed_active(db)
    consent_service.revoke_consent(s["consent"]["id"], "1.2.3.4")
    with pytest.raises(HTTPException) as exc:
        _run(db, s["student"], s["counsellor"], [_long_post(0.3)])
    assert exc.value.status_code == 403


def test_runs_with_active_consent(db):
    s = _seed_active(db)
    result = _run(db, s["student"], s["counsellor"], [_long_post(0.3)])
    assert result["student_id"] == s["student"]["id"]
    assert 0.0 <= result["rolling_score"] <= 1.0
    assert result["n_posts"] == 1
    assert result["risk_record"]["score"] == result["rolling_score"]
    assert result["alert_created"] is False
    assert result["alert"] is None


def test_high_score_creates_alert(db):
    s = _seed_active(db)
    result = _run(db, s["student"], s["counsellor"], [_long_post(0.9), _long_post(0.8)])
    assert result["rolling_score"] >= 0.65
    assert result["alert_created"] is True
    assert result["alert"] is not None
    alerts = db.get_alerts(s["counsellor"]["id"], status="OPEN")
    assert any(a["id"] == result["alert"]["id"] for a in alerts)


def test_writes_rolling_risk_audit(db):
    s = _seed_active(db)
    _run(db, s["student"], s["counsellor"], [_long_post(0.3)])
    entries = db.get_audit_log_for_target("student", s["student"]["id"])
    assert any(e["action"] == "ROLLING_RISK_COMPUTED" for e in entries)
    entries = db.get_audit_log_for_target("alert", "x")  # no alert created
    assert not entries


def test_rejects_non_list_posts(db):
    s = _seed_active(db)
    with pytest.raises(HTTPException) as exc:
        _run(db, s["student"], s["counsellor"], "nope")
    assert exc.value.status_code == 400


def test_rejects_empty_posts(db):
    s = _seed_active(db)
    with pytest.raises(HTTPException) as exc:
        _run(db, s["student"], s["counsellor"], [])
    assert exc.value.status_code == 400


def test_rejects_post_missing_risk_score(db):
    s = _seed_active(db)
    with pytest.raises(HTTPException) as exc:
        _run(db, s["student"], s["counsellor"], [{"date": "2026-01-01T00:00:00+00:00", "text": "x" * 50}])
    assert exc.value.status_code == 400


def test_error_mapping_is_stable_503():
    err = analysis_service.inference_http_error(RuntimeError("boom"))
    assert isinstance(err, HTTPException)
    assert err.status_code == 503
    assert err.detail == analysis_service.INFERENCE_UNAVAILABLE_MESSAGE
