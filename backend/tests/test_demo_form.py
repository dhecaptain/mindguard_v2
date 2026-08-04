"""Tests for Request Demo form hardening (Brief §5.5/§13.2): reCAPTCHA v3."""

import asyncio

from services import demo_service


def run(coro):
    return asyncio.run(coro)


def test_recaptcha_skipped_without_secret(monkeypatch):
    monkeypatch.delenv("RECAPTCHA_SECRET", raising=False)
    assert run(demo_service.verify_recaptcha_token(None)) is True
    assert run(demo_service.verify_recaptcha_token("")) is True


def test_recaptcha_rejects_empty_token_when_secret_set(monkeypatch):
    monkeypatch.setenv("RECAPTCHA_SECRET", "secret123")
    assert run(demo_service.verify_recaptcha_token(None)) is False
    assert run(demo_service.verify_recaptcha_token("")) is False


def test_recaptcha_success(monkeypatch):
    monkeypatch.setenv("RECAPTCHA_SECRET", "secret123")

    class _FakeResp:
        def json(self):
            return {"success": True}

    class _FakeClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, *args, **kwargs):
            return _FakeResp()

    import httpx
    monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
    assert run(demo_service.verify_recaptcha_token("good-token")) is True


def test_recaptcha_failure(monkeypatch):
    monkeypatch.setenv("RECAPTCHA_SECRET", "secret123")

    class _FakeResp:
        def json(self):
            return {"success": False, "error-codes": ["invalid-input-response"]}

    class _FakeClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, *args, **kwargs):
            return _FakeResp()

    import httpx
    monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
    assert run(demo_service.verify_recaptcha_token("bad-token")) is False


def test_recaptcha_network_error_fails_closed(monkeypatch):
    monkeypatch.setenv("RECAPTCHA_SECRET", "secret123")

    class _FakeClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, *args, **kwargs):
            raise RuntimeError("network down")

    import httpx
    monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
    assert run(demo_service.verify_recaptcha_token("token")) is False
