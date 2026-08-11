"""Tests for roster upload size cap (M5).

Roster uploads are read fully into memory; a 50 MB cap (matching the file
analysis endpoint) prevents unbounded memory use from a single upload.
"""

import os

os.environ.setdefault("JWT_SECRET", "roster-size-test-secret")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend import database  # noqa: E402
from backend.auth import hash_password  # noqa: E402


@pytest.fixture(scope="module")
def client():
    from backend.main import app

    with TestClient(app) as c:
        yield c


def _setup(db, client):
    admin = database.create_user("admin@school.edu", "Admin", hash_password("pw-12345"), role_type="admin")
    conn = db.get_db()
    conn.execute("UPDATE users SET status = 'approved' WHERE id = ?", (admin["id"],))
    conn.commit()
    conn.close()
    inst = db.create_institution("Riverside High", "secondary")
    token = client.post("/api/auth/login", json={"email": "admin@school.edu", "password": "pw-12345"}).json()["access_token"]
    return inst, {"Authorization": f"Bearer {token}"}


def test_oversized_roster_rejected_413(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    inst, headers = _setup(db, client)
    big = b"x" * (50 * 1024 * 1024 + 1024)

    resp = client.post(
        "/api/v1/admin/roster/upload",
        params={"institution_id": inst["id"]},
        files={"file": ("roster.csv", big, "text/csv")},
        headers=headers,
    )
    assert resp.status_code == 413
    assert "too large" in resp.json()["detail"].lower()


def test_small_roster_accepted(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    inst, headers = _setup(db, client)
    small = (
        b"student_id,first_name,last_name,email,date_of_birth,grade_level,parent_email\n"
        b"U-1,Alex,Roe,alex@uni.edu,2002-05-05,12,\n"
    )

    resp = client.post(
        "/api/v1/admin/roster/upload",
        params={"institution_id": inst["id"]},
        files={"file": ("roster.csv", small, "text/csv")},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["total"] == 1
