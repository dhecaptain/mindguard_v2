"""Tests for the terms->audit hook and admin audit view (Delivery Brief §11–12)."""

from backend import database
from backend import permissions as perm


def test_health_check_reports_ok(db):
    result = database.health_check()
    assert result["db"] == "ok"
    assert result["tables"] >= 1


def _user(role: str) -> dict:
    return {"role_type": role, "permissions_json": None}


def test_admin_has_audit_view_permission():
    assert perm.has_permission(_user("admin"), perm.PERM_AUDIT_VIEW)
    assert not perm.has_permission(_user("counsellor"), perm.PERM_AUDIT_VIEW)
    assert not perm.has_permission(_user("student"), perm.PERM_AUDIT_VIEW)


def test_terms_acceptance_is_idempotent_and_auditable(db):
    user = db.create_user("terms@school.edu", "Terms User", "x", role_type="counsellor")
    assert db.accept_user_terms(user["id"]) is True
    assert db.accept_user_terms(user["id"]) is False
    row = db.get_user_by_id(user["id"])
    assert row["terms_accepted_at"] is not None


def test_write_and_read_terms_audit_entry(db):
    user = db.create_user("audit@school.edu", "Audit User", "x", role_type="student")
    aid = db.write_audit(user["id"], "student", "TERMS_ACCEPTED", "user", user["id"], ip="1.2.3.4")
    all_log = db.get_all_audit_log()
    assert any(e["id"] == aid and e["action"] == "TERMS_ACCEPTED" for e in all_log)
    scoped = db.get_all_audit_log(action="TERMS_ACCEPTED")
    assert len(scoped) == 1 and scoped[0]["actor_id"] == user["id"]


def test_admin_audit_log_newest_first(db):
    a = db.create_user("a@school.edu", "A", "x", role_type="student")
    b = db.create_user("b@school.edu", "B", "x", role_type="student")
    db.write_audit(a["id"], "student", "USER_REGISTERED", "user", a["id"])
    db.write_audit(b["id"], "student", "USER_REGISTERED", "user", b["id"])
    log = db.get_all_audit_log(limit=10)
    times = [e["occurred_at"] for e in log]
    assert times == sorted(times, reverse=True)


def test_audit_view_requires_permission():
    perm.require_permission(_user("admin"), perm.PERM_AUDIT_VIEW)
    import pytest
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        perm.require_permission(_user("counsellor"), perm.PERM_AUDIT_VIEW)
    assert exc.value.status_code == 403
