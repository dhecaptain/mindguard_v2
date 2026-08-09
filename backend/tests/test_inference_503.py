"""Tests for the inference memory guard mapping to a clean 503 (H5).

On a host with too little RAM the guard raises ``InferenceUnavailableError``
before torch is imported. Every inference route must surface that as a 503
"service unavailable" — not a 400 client error, and not an OOM kill.
"""

import os

os.environ.setdefault("JWT_SECRET", "inference-503-test-secret")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend import database  # noqa: E402
from backend.auth import hash_password  # noqa: E402
from backend.main import app  # noqa: E402
from backend.services.predictor import InferenceUnavailableError  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _token(client) -> str:
    user = database.create_user("h5@school.edu", "H5 User", hash_password("pw-12345"), role_type="counsellor")
    conn = database.get_db()
    conn.execute("UPDATE users SET status = 'approved' WHERE id = ?", (user["id"],))
    conn.commit()
    conn.close()
    return client.post("/api/auth/login", json={"email": "h5@school.edu", "password": "pw-12345"}).json()["access_token"]


def test_global_handler_maps_unavailable_to_503(monkeypatch, db, client):
    headers = {"Authorization": f"Bearer {_token(client)}"}

    async def _boom():
        raise InferenceUnavailableError("need >= 1500 MB, have ~400 MB")

    monkeypatch.setattr("backend.main.predict_one", _boom)

    resp = client.post("/api/analysis/text", json={"text": "hello"}, headers=headers)
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"].lower()


def test_file_upload_maps_unavailable_to_503(monkeypatch, db, client):
    headers = {"Authorization": f"Bearer {_token(client)}"}

    async def _boom(texts):
        raise InferenceUnavailableError("need >= 1500 MB, have ~400 MB")

    monkeypatch.setattr("backend.main.predict_batch", _boom)

    resp = client.post(
        "/api/platforms/file",
        files={"file": ("posts.txt", b"some post text here\n", "text/plain")},
        headers=headers,
    )
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"].lower()


def test_unavailable_is_a_runtime_error_subclass():
    assert issubclass(InferenceUnavailableError, RuntimeError)
