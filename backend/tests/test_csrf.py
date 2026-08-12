"""CSRF Origin-check middleware tests.

The middleware rejects state-changing requests whose Origin is neither the
request's own host nor an explicitly trusted origin, and rejects cross-site
``Sec-Fetch-Site`` requests outright. Safe methods and non-browser clients
(no Origin header) are unaffected.
"""

from fastapi.testclient import TestClient

from backend.main import _TRUSTED_ORIGINS, app

_DEMO_BODY = {
    "full_name": "Test User",
    "work_email": "tester@school.edu",
    "organisation": "Test School",
    "consent_to_contact": True,
}


def test_safe_method_passes_any_origin():
    with TestClient(app) as c:
        resp = c.get("/api/v1/healthz", headers={"Origin": "https://evil.example"})
        assert resp.status_code == 200


def test_unsafe_request_from_untrusted_origin_blocked():
    with TestClient(app) as c:
        resp = c.post("/api/v1/demo-requests", json=_DEMO_BODY, headers={"Origin": "https://evil.example"})
        assert resp.status_code == 403


def test_unsafe_request_from_trusted_origin_allowed():
    assert "http://localhost:5173" in _TRUSTED_ORIGINS
    with TestClient(app) as c:
        resp = c.post("/api/v1/demo-requests", json=_DEMO_BODY, headers={"Origin": "http://localhost:5173"})
        assert resp.status_code != 403


def test_unsafe_request_same_origin_allowed():
    with TestClient(app) as c:
        # TestClient's default Host is "testserver".
        resp = c.post("/api/v1/demo-requests", json=_DEMO_BODY, headers={"Origin": "http://testserver"})
        assert resp.status_code != 403


def test_cross_site_sec_fetch_header_blocked():
    with TestClient(app) as c:
        resp = c.post(
            "/api/v1/demo-requests",
            json=_DEMO_BODY,
            headers={"Origin": "https://evil.example", "Sec-Fetch-Site": "cross-site"},
        )
        assert resp.status_code == 403


def test_no_origin_non_browser_client_allowed():
    with TestClient(app) as c:
        resp = c.post("/api/v1/demo-requests", json=_DEMO_BODY)
        assert resp.status_code != 403
