"""OpenAPI contract test (Delivery Brief §11).

The generated OpenAPI document is the contract between the current Railway
backend and the Phase 2 migration target. This test pins the public surface —
paths, methods, doc quality — and the consent-gate contract on analysis, so a
migration that drops or renames an endpoint fails loudly here.
"""

import os

# The app requires JWT_SECRET at import time (backend.auth). Make this test
# self-sufficient so the offline CI unit job does not depend on a .env file.
os.environ.setdefault("JWT_SECRET", "openapi-contract-test-secret")

import pytest  # noqa: E402


@pytest.fixture(scope="module")
def spec():
    from backend.main import app

    return app.openapi()


def test_spec_shape(spec):
    assert spec["openapi"].startswith("3.")
    assert spec["info"]["title"]
    assert spec["info"]["version"]


# Public API surface from Delivery Brief §6 (with the /api/v1 prefix the app
# actually uses). Adding or removing an endpoint must be reflected here.
BRIEF_ENDPOINTS = {
    "/api/v1/admin/roster/upload": {"post"},
    "/api/v1/admin/roster/commit": {"post"},
    "/api/v1/consents": {"get"},
    "/api/v1/consents/{consent_id}": {"get"},
    "/api/v1/students/{student_id}/consent": {"post"},
    "/api/v1/consents/{consent_id}/dispatch": {"post"},
    "/api/v1/consents/{consent_id}/cancel": {"post"},
    "/api/v1/consents/{consent_id}/remind": {"post"},
    "/api/v1/consents/export": {"get"},
    "/api/v1/portal/consents/{token}": {"get"},
    "/api/v1/portal/consents/{token}/accept": {"post"},
    "/api/v1/portal/consents/{token}/decline": {"post"},
    "/api/v1/portal/consents/{token}/revoke": {"post"},
    "/api/v1/demo-requests": {"post"},
    "/api/v1/admin/demo-requests": {"get"},
    "/api/v1/admin/demo-requests/{demo_request_id}": {"patch"},
    "/api/v1/students/{student_id}/analyze": {"post"},
    "/webhooks/email/resend": {"post"},
    "/api/health": {"get"},
    "/api/v1/healthz": {"get"},
}


def test_brief_endpoints_documented(spec):
    paths = spec["paths"]
    for path, methods in BRIEF_ENDPOINTS.items():
        assert path in paths, f"missing path {path}"
        for method in methods:
            assert method in paths[path], f"missing {method.upper()} {path}"


def test_operations_have_descriptions(spec):
    for path, item in spec["paths"].items():
        for method, op in item.items():
            if method == "parameters":
                continue
            assert op.get("summary") or op.get("description"), (
                f"{method.upper()} {path} lacks summary/description"
            )


def test_analyze_documents_consent_gate(spec):
    op = spec["paths"]["/api/v1/students/{student_id}/analyze"]["post"]
    status_codes = {int(code) for code in op["responses"]}
    assert 403 in status_codes
    assert 503 in status_codes
    assert "consent" in op["responses"]["403"]["description"].lower()


def test_public_consent_portal_has_no_request_body_auth_param(spec):
    accept = spec["paths"]["/api/v1/portal/consents/{token}/accept"]["post"]
    assert "security" not in accept
