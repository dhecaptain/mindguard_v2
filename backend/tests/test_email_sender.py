"""Tests for the email sender (Resend primary + SMTP fallback + email_events logging)."""

import pytest

from services import email_sender


@pytest.fixture(autouse=True)
def clear_env(monkeypatch):
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    monkeypatch.delenv("SMTP_USER", raising=False)
    monkeypatch.delenv("SMTP_PASSWORD", raising=False)
    monkeypatch.setenv("EMAIL_FROM", "MindGuard <noreply@example.com>")


def test_is_resend_configured(monkeypatch):
    assert not email_sender.is_resend_configured()
    monkeypatch.setenv("RESEND_API_KEY", "re_123")
    assert email_sender.is_resend_configured()


def test_email_from_defaults_to_brand_not_personal(monkeypatch):
    monkeypatch.delenv("EMAIL_FROM", raising=False)
    assert email_sender.get_email_from() == "MindGuard <noreply@mindguard.ai>"


def test_email_from_uses_configured_verified_domain(monkeypatch):
    monkeypatch.setenv("EMAIL_FROM", "MindGuard <no-reply@schools.example.org>")
    assert email_sender.get_email_from() == "MindGuard <no-reply@schools.example.org>"


def test_email_from_warns_on_personal_sender(monkeypatch, caplog):
    import logging

    email_sender._personal_from_warned = False
    monkeypatch.setenv("EMAIL_FROM", "MindGuard <davidpolycarp298@gmail.com>")
    with caplog.at_level(logging.WARNING, logger="backend.services.email_sender"):
        value = email_sender.get_email_from()
    assert value == "MindGuard <davidpolycarp298@gmail.com>"
    assert any("EMAIL_FROM" in r.message for r in caplog.records)
    email_sender._personal_from_warned = False


def test_no_provider_returns_error(db):
    ok, err = email_sender.send_html_email("a@b.c", "Subject", "<p>Hi</p>")
    assert ok is False
    assert "SMTP is not configured" in err


def test_no_provider_logs_failed_event(db):
    ok, _ = email_sender.send_html_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="consent", related_id="c-1",
    )
    assert ok is False
    events = db.get_email_events(related_type="consent", related_id="c-1")
    assert len(events) == 1
    assert events[0]["event"] == "failed"
    assert events[0]["recipient_email"] == "a@b.c"


def test_smtp_success_is_used_when_resend_unset(db, monkeypatch):
    calls = []
    real = email_sender._send_smtp

    def fake_smtp(to, subject, body):
        calls.append((to, subject))
        return real if False else (True, "")

    monkeypatch.setattr(email_sender, "_send_smtp", fake_smtp)
    ok, err = email_sender.send_html_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="demo", related_id="d-1",
    )
    assert ok is True and err == ""
    assert calls == [("a@b.c", "Subject")]
    events = db.get_email_events(related_type="demo", related_id="d-1")
    assert len(events) == 1
    assert events[0]["event"] == "sent"


def test_resend_preferred_over_smtp(db, monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "re_123")
    smtp_called = []

    monkeypatch.setattr(email_sender, "_send_smtp", lambda *a, **k: smtp_called.append(1) or (True, ""))

    def fake_resend(to, subject, body):
        return True, "", "resend-msg-42"

    monkeypatch.setattr(email_sender, "_send_resend", fake_resend)
    ok, err = email_sender.send_html_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="consent", related_id="c-1",
    )
    assert ok is True and err == ""
    assert smtp_called == []


def test_resend_success_logs_esp_message_id(db, monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "re_123")

    def fake_resend(to, subject, body):
        return True, "", "resend-msg-42"

    monkeypatch.setattr(email_sender, "_send_resend", fake_resend)
    ok, err = email_sender.send_html_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="consent", related_id="c-1",
    )
    assert ok is True and err == ""
    events = db.get_email_events(related_type="consent", related_id="c-1")
    assert events[0]["event"] == "sent"
    assert events[0]["esp_message_id"] == "resend-msg-42"


def test_resend_failure_falls_back_to_smtp(db, monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "re_123")
    smtp_called = []

    def fake_smtp(to, subject, body):
        smtp_called.append(to)
        return True, ""

    monkeypatch.setattr(email_sender, "_send_smtp", fake_smtp)
    monkeypatch.setattr(email_sender, "_send_resend", lambda *a, **k: (False, "resend down", ""))
    ok, err = email_sender.send_html_email("a@b.c", "Subject", "<p>Hi</p>")
    assert ok is True and err == ""
    assert smtp_called == ["a@b.c"]


def test_resend_http_error_is_reported(monkeypatch):
    """Non-2xx from Resend yields a clear error string."""
    import httpx

    class _FakeResp:
        status_code = 401
        text = '{"message": "unauthorized"}'

        def json(self):
            return {"message": "unauthorized"}

    class _FakeClient:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def post(self, *args, **kwargs):
            return _FakeResp()

    monkeypatch.setattr(httpx, "Client", lambda **kwargs: _FakeClient())
    monkeypatch.setenv("RESEND_API_KEY", "re_123")
    ok, err, msg_id = email_sender._send_resend("a@b.c", "Subject", "<p>Hi</p>")
    assert ok is False
    assert msg_id == ""
    assert "401" in err and "unauthorized" in err
