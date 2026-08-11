"""Tests for the yt-dlp SSRF guard (M3).

Video/channel URLs handed to yt-dlp must point at public hosts. Literal
loopback/private/cloud-metadata hosts and names resolving only to private
addresses are rejected before any download is attempted.
"""

import os

os.environ.setdefault("JWT_SECRET", "video-ssrf-test-secret")

import pytest  # noqa: E402
from fastapi import HTTPException  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend import database  # noqa: E402
from backend.auth import hash_password  # noqa: E402
from backend.main import _validate_public_video_url  # noqa: E402


@pytest.fixture(scope="module")
def client():
    from backend.main import app

    with TestClient(app) as c:
        yield c


def _approve(db, user_id: str) -> None:
    conn = db.get_db()
    conn.execute("UPDATE users SET status = 'approved' WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()


@pytest.mark.parametrize("url", [
    "http://localhost/video",
    "http://127.0.0.1:8000/x.mp4",
    "http://10.0.0.1/x",
    "http://192.168.1.1/x",
    "http://172.16.0.1/x",
    "http://169.254.169.254/latest/meta-data/",
    "ftp://youtube.com/x",
    "not a url",
    "",
    "youtube.com/watch?v=abc",
])
def test_rejects_non_public_video_urls(url):
    with pytest.raises(HTTPException):
        _validate_public_video_url(url)


def test_http_endpoint_rejects_localhost_before_download(db, client, monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    user = database.create_user("vid1@school.edu", "Video Staff", hash_password("pw-12345"), role_type="counsellor")
    _approve(db, user["id"])
    token = client.post("/api/auth/login", json={"email": "vid1@school.edu", "password": "pw-12345"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/platforms/video",
        headers=headers,
        json={"video_url": "http://127.0.0.1:8000/internal.mp4"},
    )
    assert resp.status_code == 400
    assert "Invalid" in resp.json()["detail"]
