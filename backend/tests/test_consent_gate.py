"""Tests for consent gating, signed tokens and maintenance batches (Brief §5–7)."""

from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

from backend import database
from backend.config import CONSENT_EXPIRY_DAYS
from backend.services import consent_gate, consent_service
from backend.services import crypto


def _seed(db) -> dict:
    counsellor = db.create_user("counsellor@school.edu", "Counsellor", "x", role_type="counsellor")
    student = db.create_user("student@school.edu", "Student", "x", role_type="student")
    consent = db.create_consent(student["id"], counsellor["id"], "student@school.edu", "student", ["reddit"])
    return {"counsellor": counsellor, "student": student, "consent": consent}


def test_dispatch_issues_signed_token(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    assert updated["status"] == "PENDING"
    assert updated["magic_token"].startswith("v1.")
    assert updated["signed_token_hash"] == crypto.hash_token(updated["magic_token"])
    assert consent_service.verify_consent_token(updated, updated["magic_token"])


def test_verify_token_rejects_tampering(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    assert consent_service.verify_consent_token(updated, updated["magic_token"])
    tampered = updated["magic_token"][:-1] + ("a" if updated["magic_token"][-1] != "a" else "b")
    assert not consent_service.verify_consent_token(updated, tampered)


def test_verify_token_accepts_legacy_uuid(db):
    s = _seed(db)
    consent = s["consent"]  # created with plain-uuid magic_token
    assert consent["magic_token"].startswith("v1.") is False
    assert consent_service.verify_consent_token(consent, consent["magic_token"])


def test_accept_extends_expiry(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    accepted = consent_service.accept_consent(updated["id"], "Student", "1.2.3.4")
    assert accepted["status"] == "ACCEPTED"
    expiry = datetime.fromisoformat(accepted["expires_at"])
    assert expiry > datetime.now(timezone.utc) + timedelta(days=20)


def test_gate_blocks_without_active_consent(db):
    s = _seed(db)
    with pytest.raises(HTTPException) as exc:
        consent_gate.require_consent_for_analysis(s["student"]["id"])
    assert exc.value.status_code == 403


def test_gate_passes_with_active_consent(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    consent_service.accept_consent(updated["id"], "Student", "1.2.3.4")
    consent = consent_gate.require_consent_for_analysis(s["student"]["id"])
    assert consent["status"] == "ACCEPTED"
    assert consent_gate.consent_status_for_ui(s["student"]["id"])["active"] is True


def test_gate_blocks_revoked_consent(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    consent_service.accept_consent(updated["id"], "Student", "1.2.3.4")
    consent_service.revoke_consent(updated["id"], "1.2.3.4")
    with pytest.raises(HTTPException):
        consent_gate.require_consent_for_analysis(s["student"]["id"])


def test_view_cap_counts_views(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    for _ in range(3):
        consent_service.record_view(updated["id"])
    assert consent_service.view_count(updated["id"]) == 3
    assert consent_service.remaining_views(updated["id"]) == consent_service.MAX_CONSENT_VIEWS - 3


def test_process_expired_consents(db):
    s = _seed(db)
    cid = s["consent"]["id"]
    database.update_consent_status(cid, "PENDING", expires_at=(
        datetime.now(timezone.utc) - timedelta(days=1)).isoformat())
    assert consent_service.process_expired_consents() == 1
    assert database.get_consent_by_id(cid)["status"] == "EXPIRED"


def test_process_reminders_day3(monkeypatch, db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    sent = []

    def fake_send(to, subject, body, **kwargs):
        sent.append((to, subject))
        return True, ""

    monkeypatch.setattr(consent_service, "send_html_email", fake_send)
    now = datetime.now(timezone.utc)
    dispatched = (now - timedelta(days=3)).isoformat()
    database.update_consent_status(updated["id"], "PENDING", dispatched_at=dispatched)

    summary = consent_service.process_consent_reminders(now=now)
    assert summary["sent"] == 1
    consent = database.get_consent_by_id(updated["id"])
    assert consent["reminders_sent"] == 1

    summary2 = consent_service.process_consent_reminders(now=now)
    assert summary2["sent"] == 0


def test_dispatch_uses_consent_expiry_days(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    token_expiry = datetime.fromisoformat(updated["magic_token_expires_at"])
    expires_at = datetime.fromisoformat(updated["expires_at"])
    now = datetime.now(timezone.utc)
    assert abs((token_expiry - now).total_seconds() - CONSENT_EXPIRY_DAYS * 86400) < 300
    assert abs((expires_at - now).total_seconds() - CONSENT_EXPIRY_DAYS * 86400) < 300
    assert updated["template_version"] == consent_service.CONSENT_TEMPLATE_VERSION


def test_gate_blocks_expired_accepted_consent(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    consent_service.accept_consent(updated["id"], "Student", "1.2.3.4")
    database.update_consent_status(updated["id"], "ACCEPTED", expires_at=(
        datetime.now(timezone.utc) - timedelta(days=1)).isoformat())
    with pytest.raises(HTTPException):
        consent_gate.require_consent_for_analysis(s["student"]["id"])
    assert consent_gate.consent_status_for_ui(s["student"]["id"])["active"] is False


def test_process_expired_accepted_becomes_renewal_due(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    consent_service.accept_consent(updated["id"], "Student", "1.2.3.4")
    database.update_consent_status(updated["id"], "ACCEPTED", expires_at=(
        datetime.now(timezone.utc) - timedelta(days=1)).isoformat())
    assert consent_service.process_expired_consents() == 1
    assert database.get_consent_by_id(updated["id"])["status"] == "RENEWAL_DUE"


def test_revoke_marks_analyses_consent_withdrawn(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    consent_service.accept_consent(updated["id"], "Student", "1.2.3.4")
    db.save_analysis(s["student"]["id"], "reddit", "some text", 0.91, "high")
    db.save_analysis(s["student"]["id"], "reddit", "more text", 0.31, "low")
    revoked = consent_service.revoke_consent(updated["id"], "1.2.3.4", user_agent="Test-UA/1.0")
    assert revoked["status"] == "REVOKED"
    conn = db.get_db()
    rows = conn.execute(
        "SELECT consent_withdrawn_at FROM analyses WHERE user_id = ?",
        (s["student"]["id"],),
    ).fetchall()
    conn.close()
    assert len(rows) == 2
    assert all(r["consent_withdrawn_at"] is not None for r in rows)


def test_response_user_agent_captured(db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    consent_service.record_view(updated["id"], user_agent="Parent-Browser/5.0")
    consent_service.accept_consent(updated["id"], "Parent", "1.2.3.4", user_agent="Parent-Browser/5.0")
    consent = database.get_consent_by_id(updated["id"])
    assert consent["response_user_agent"] == "Parent-Browser/5.0"

    second = db.create_consent(
        s["student"]["id"], s["counsellor"]["id"], "student@school.edu", "student", ["reddit"]
    )
    declined = consent_service.dispatch_consent(second["id"], s["counsellor"]["id"])
    consent_service.decline_consent(declined["id"], "5.6.7.8", "Chrome/120")
    consent = database.get_consent_by_id(declined["id"])
    assert consent["response_user_agent"] == "Chrome/120"


def test_process_reminders_day7_after_day3(monkeypatch, db):
    s = _seed(db)
    updated = consent_service.dispatch_consent(s["consent"]["id"], s["counsellor"]["id"])
    sent = []

    def fake_send(to, subject, body, **kwargs):
        sent.append(subject)
        return True, ""

    monkeypatch.setattr(consent_service, "send_html_email", fake_send)
    now = datetime.now(timezone.utc)
    dispatched = (now - timedelta(days=7)).isoformat()
    database.update_consent_status(updated["id"], "PENDING", dispatched_at=dispatched, reminders_sent=1)

    summary = consent_service.process_consent_reminders(now=now)
    assert summary["sent"] == 1
    assert database.get_consent_by_id(updated["id"])["reminders_sent"] == 2
    assert "Last few days" in sent[0]
