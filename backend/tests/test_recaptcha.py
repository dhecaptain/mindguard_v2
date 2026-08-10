"""Tests for reCAPTCHA enforcement on public auth routes (H3).

When ``RECAPTCHA_SECRET`` is set, login/register/google must refuse requests
without a valid token. When it is unset the site is not enrolled and the flow
must keep working (local dev).
"""

import os

os.environ.setdefault("JWT_SECRET", "recaptcha-test-secret")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend.main import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_auth_allowed_when_captcha_not_enrolled(monkeypatch, db, client):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)

    resp = client.post(
        "/api/auth/register",
        json={"name": "No Captcha", "email": "nc@school.edu", "password": "pw-12345", "role": "student"},
    )
    assert resp.status_code == 200, resp.text

    login = client.post("/api/auth/login", json={"email": "nc@school.edu", "password": "pw-12345"})
    assert login.status_code == 200
    assert "access_token" in login.json()


def test_login_rejects_without_token_when_enrolled(monkeypatch, db, client):
    monkeypatch.setenv("RECAPTCHA_SECRET", "test-secret-123")

    resp = client.post("/api/auth/login", json={"email": "nc@school.edu", "password": "pw-12345"})
    assert resp.status_code == 403
    assert "reCAPTCHA" in resp.json()["detail"]


def test_register_rejects_without_token_when_enrolled(monkeypatch, db, client):
    monkeypatch.setenv("RECAPTCHA_SECRET", "test-secret-123")

    resp = client.post(
        "/api/auth/register",
        json={"name": "Blocked", "email": "blocked@school.edu", "password": "pw-12345", "role": "student"},
    )
    assert resp.status_code == 403
    assert "reCAPTCHA" in resp.json()["detail"]


def test_google_rejects_without_token_when_enrolled(monkeypatch, db, client):
    monkeypatch.setenv("RECAPTCHA_SECRET", "test-secret-123")

    resp = client.post("/api/auth/google", json={"access_token": "anything"})
    assert resp.status_code == 403
    assert "reCAPTCHA" in resp.json()["detail"]
