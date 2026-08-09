"""Tests for admin provisioning, password rotation and seed hardening.

Covers the production admin-access path:
- ``seed_defaults`` must never ship a known default admin password.
- ``MINDGUARD_ADMIN_PASSWORD`` controls the seeded admin credential.
- ``MINDGUARD_BOOTSTRAP_ADMIN_EMAIL`` promotes existing users to admin at startup
  (idempotent, audit-logged, never auto-creates accounts).
- ``POST /api/auth/change-password`` lets a user rotate their own password.
"""

import os

os.environ.setdefault("JWT_SECRET", "admin-bootstrap-test-secret")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend import database  # noqa: E402
from backend.auth import hash_password, verify_password  # noqa: E402


def _register(client, email: str, password: str) -> dict:
    resp = client.post(
        "/api/auth/register",
        json={"name": "Admin User", "email": email, "password": password, "role": "counsellor"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["user"]


def _login(client, email: str, password: str):
    return client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )


# ── seed_defaults hardening ─────────────────────────────────────────────

def test_seed_defaults_admin_has_no_known_default_password(db, monkeypatch):
    monkeypatch.delenv("MINDGUARD_ADMIN_PASSWORD", raising=False)
    database.seed_defaults()
    admin = database.get_user_by_email("admin@mindguard.org")
    assert admin is not None
    assert not verify_password("password", admin["password_hash"])
    assert verify_password("admin", admin["password_hash"]) is False


def test_seed_defaults_admin_env_password(db, monkeypatch):
    monkeypatch.setenv("MINDGUARD_ADMIN_PASSWORD", "s3cret!XyZ")
    database.seed_defaults()
    admin = database.get_user_by_email("admin@mindguard.org")
    assert verify_password("s3cret!XyZ", admin["password_hash"])


# ── user role / password mutation helpers ──────────────────────────────

def test_update_user_role_and_password(db):
    user = db.create_user("ops@school.edu", "Ops", hash_password("old-pass-1"), role_type="counsellor")
    promoted = db.update_user_role(user["id"], "admin")
    assert promoted["role_type"] == "admin"
    assert db.update_user_role("nope", "admin") is None

    assert db.update_user_password(user["id"], hash_password("new-pass-1"))
    assert verify_password("new-pass-1", db.get_user_by_id(user["id"])["password_hash"])
    assert not db.update_user_password("nope", hash_password("x"))


# ── startup bootstrap ──────────────────────────────────────────────────

def test_bootstrap_promotes_matching_user(db, monkeypatch):
    from backend.main import _bootstrap_admins

    user = db.create_user("head@school.edu", "Head", "x", role_type="counsellor")
    monkeypatch.setenv("MINDGUARD_BOOTSTRAP_ADMIN_EMAIL", "head@school.edu")
    _bootstrap_admins()
    assert db.get_user_by_id(user["id"])["role_type"] == "admin"
    entries = [
        r for r in database.get_all_audit_log(limit=50)
        if r["action"] == "USER_PROMOTED" and r["actor_id"] == user["id"]
    ]
    assert len(entries) == 1
    assert entries[0]["payload_json"] is not None and "bootstrap" in entries[0]["payload_json"]


def test_bootstrap_is_idempotent(db, monkeypatch):
    from backend.main import _bootstrap_admins

    user = db.create_user("head2@school.edu", "Head", "x", role_type="counsellor")
    monkeypatch.setenv("MINDGUARD_BOOTSTRAP_ADMIN_EMAIL", "head2@school.edu")
    _bootstrap_admins()
    _bootstrap_admins()
    assert db.get_user_by_id(user["id"])["role_type"] == "admin"
    entries = [
        r for r in database.get_all_audit_log(limit=50)
        if r["action"] == "USER_PROMOTED" and r["actor_id"] == user["id"]
    ]
    assert len(entries) == 1


def test_bootstrap_skips_unknown_email(db, monkeypatch):
    from backend.main import _bootstrap_admins

    monkeypatch.setenv("MINDGUARD_BOOTSTRAP_ADMIN_EMAIL", "ghost@school.edu")
    _bootstrap_admins()  # must not raise or auto-create an account
    assert database.get_user_by_email("ghost@school.edu") is None


def test_bootstrap_empty_env_is_noop(db, monkeypatch):
    from backend.main import _bootstrap_admins

    monkeypatch.setenv("MINDGUARD_BOOTSTRAP_ADMIN_EMAIL", "")
    _bootstrap_admins()
    assert database.get_all_users() == []


# ── change-password endpoint ───────────────────────────────────────────

@pytest.fixture(scope="module")
def client():
    from backend.main import app

    with TestClient(app) as c:
        yield c


def test_change_password_endpoint(db, client):
    user = _register(client, "rotate@school.edu", "original-pass")
    token = _login(client, "rotate@school.edu", "original-pass").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/auth/change-password",
        headers=headers,
        json={"current_password": "original-pass", "new_password": "rotated-pass"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["ok"] is True
    assert _login(client, "rotate@school.edu", "rotated-pass").status_code == 200
    assert _login(client, "rotate@school.edu", "original-pass").status_code == 401

    audit = [
        r for r in database.get_all_audit_log(limit=50)
        if r["action"] == "PASSWORD_CHANGED" and r["actor_id"] == user["id"]
    ]
    assert len(audit) == 1


def test_change_password_wrong_current(db, client):
    _register(client, "rotate2@school.edu", "original-pass")
    token = _login(client, "rotate2@school.edu", "original-pass").json()["access_token"]
    resp = client.post(
        "/api/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "wrong-pass", "new_password": "rotated-pass"},
    )
    assert resp.status_code == 401


def test_change_password_same_password(db, client):
    _register(client, "rotate3@school.edu", "original-pass")
    token = _login(client, "rotate3@school.edu", "original-pass").json()["access_token"]
    resp = client.post(
        "/api/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "original-pass", "new_password": "original-pass"},
    )
    assert resp.status_code == 400


def test_change_password_requires_auth(db, client):
    resp = client.post(
        "/api/auth/change-password",
        json={"current_password": "x", "new_password": "y"},
    )
    assert resp.status_code in (401, 422)
