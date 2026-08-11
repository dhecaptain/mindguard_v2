"""Tests for counsellor student-list scoping (M7).

A counsellor must not be able to enumerate the platform-wide student
directory. ``GET /api/counsellor/students`` is scoped to students the
counsellor has a consent relationship with; admins still see all.
"""

import os

os.environ.setdefault("JWT_SECRET", "student-scope-test-secret")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend import database  # noqa: E402
from backend.auth import hash_password  # noqa: E402


@pytest.fixture(scope="module")
def client():
    from backend.main import app

    with TestClient(app) as c:
        yield c


def _make(db, email: str, role: str) -> dict:
    user = database.create_user(email, email.split("@")[0].title(), hash_password("pw-12345"), role_type=role)
    conn = db.get_db()
    conn.execute("UPDATE users SET status = 'approved' WHERE id = ?", (user["id"],))
    conn.commit()
    conn.close()
    return user


def _token(client, email: str) -> str:
    return client.post("/api/auth/login", json={"email": email, "password": "pw-12345"}).json()["access_token"]


def test_counsellor_sees_only_consent_linked_students(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    a = _make(db, "scope1@school.edu", "counsellor")
    b = _make(db, "scope2@school.edu", "counsellor")
    s1 = _make(db, "s1@school.edu", "student")
    s2 = _make(db, "s2@school.edu", "student")
    s3 = _make(db, "s3@school.edu", "student")

    database.create_consent(s1["id"], a["id"], "s1@school.edu", "student", ["reddit"])
    database.create_consent(s2["id"], b["id"], "s2@school.edu", "student", ["reddit"])

    token = _token(client, "scope1@school.edu")
    resp = client.get("/api/counsellor/students", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    emails = {s["email"] for s in resp.json()}
    assert emails == {"s1@school.edu"}, f"expected only consent-linked student, got {emails}"


def test_counsellor_with_no_consents_sees_empty_list(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    a = _make(db, "scope3@school.edu", "counsellor")
    _make(db, "s4@school.edu", "student")

    token = _token(client, "scope3@school.edu")
    resp = client.get("/api/counsellor/students", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json() == []


def test_admin_still_sees_all_students(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    admin = _make(db, "scopeadmin@school.edu", "admin")
    s1 = _make(db, "s5@school.edu", "student")
    s2 = _make(db, "s6@school.edu", "student")

    token = _token(client, "scopeadmin@school.edu")
    resp = client.get("/api/counsellor/students", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    emails = {s["email"] for s in resp.json()}
    assert emails == {"s5@school.edu", "s6@school.edu"}


def test_student_detail_requires_consent_relationship(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    a = _make(db, "scope4@school.edu", "counsellor")
    b = _make(db, "scope5@school.edu", "counsellor")
    s = _make(db, "s7@school.edu", "student")
    database.create_consent(s["id"], a["id"], "s7@school.edu", "student", ["reddit"])

    outsider = _token(client, "scope5@school.edu")
    resp = client.get(f"/api/counsellor/students/{s['id']}", headers={"Authorization": f"Bearer {outsider}"})
    assert resp.status_code == 403

    owner = _token(client, "scope4@school.edu")
    resp = client.get(f"/api/counsellor/students/{s['id']}", headers={"Authorization": f"Bearer {owner}"})
    assert resp.status_code == 200, resp.text
