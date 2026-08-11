"""Tests for the persistent JWT blacklist (M1).

Revoked tokens now live in the ``revoked_tokens`` table (not just an
in-memory set), so logout/change-password revocation survives restarts and is
shared across processes. Expired rows are pruned opportunistically on write.
"""

import os

os.environ.setdefault("JWT_SECRET", "blacklist-test-secret")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend import database  # noqa: E402
from backend.auth import hash_password  # noqa: E402


@pytest.fixture(scope="module")
def client():
    from backend.main import app

    with TestClient(app) as c:
        yield c


def _login(client, email: str, password: str = "pw-12345") -> str:
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def test_logout_persists_revocation_and_rejects_token(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    database.create_user("bl1@school.edu", "Blacklist One", hash_password("pw-12345"), role_type="student")
    token = _login(client, "bl1@school.edu")

    resp = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200

    conn = database.get_db()
    row = conn.execute(
        "SELECT jti, expires_at FROM revoked_tokens WHERE jti IN "
        "(SELECT jti FROM revoked_tokens)"
    ).fetchone()
    conn.close()
    assert row is not None, "logout must persist a revoked_tokens row"
    assert row["expires_at"], "revoked token must carry an expiry for pruning"

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401
    assert "revoked" in resp.json()["detail"].lower()


def test_change_password_revokes_old_token(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    database.create_user("bl2@school.edu", "Blacklist Two", hash_password("pw-12345"), role_type="student")
    old_token = _login(client, "bl2@school.edu")

    resp = client.post(
        "/api/auth/change-password",
        headers={"Authorization": f"Bearer {old_token}"},
        json={"current_password": "pw-12345", "new_password": "new-pw-67890"},
    )
    assert resp.status_code == 200, resp.text

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {old_token}"})
    assert resp.status_code == 401

    new_token = _login(client, "bl2@school.edu", password="new-pw-67890")
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {new_token}"})
    assert resp.status_code == 200


def test_expired_rows_pruned_on_write(db):
    from datetime import datetime, timedelta, timezone

    past = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    conn = database.get_db()
    conn.execute(
        "INSERT INTO revoked_tokens (jti, revoked_at, expires_at) VALUES (?,?,?)",
        ("expired-jti", past, past),
    )
    conn.commit()
    conn.close()
    assert database.is_token_revoked("expired-jti") is True

    database.revoke_token("fresh-jti", expires_at=past)

    assert database.is_token_revoked("fresh-jti") is True
    conn = database.get_db()
    row = conn.execute(
        "SELECT 1 FROM revoked_tokens WHERE jti = 'expired-jti'"
    ).fetchone()
    conn.close()
    assert row is None, "expired rows must be pruned on the next write"
