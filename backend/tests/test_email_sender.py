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


def test_provider_status_handles_malformed_sender(monkeypatch):
    """A malformed EMAIL_FROM (no address) must yield diagnostics, not an error."""
    monkeypatch.setenv("RESEND_API_KEY", "re_123")
    monkeypatch.setenv("EMAIL_FROM", "Plain Display Name Only")
    status = email_sender.get_email_provider_status()
    assert status["sender_valid"] is False
    assert status["resend_configured"] is True


def test_resend_provider_status_is_safe_and_explicit(monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "re_123")
    monkeypatch.setenv("RESEND_WEBHOOK_SECRET", "whsec_123")
    monkeypatch.setenv("EMAIL_FROM", "MindGuard <no-reply@schools.example.org>")
    status = email_sender.get_email_provider_status()
    assert status["provider"] == "resend"
    assert status["resend_configured"] is True
    assert status["webhook_configured"] is True
    assert status["sender_valid"] is True
    assert "re_123" not in str(status)
    assert "whsec_123" not in str(status)


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
    assert "Resend is not configured" in err


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


def test_resend_is_required_no_smtp_fallback(db, monkeypatch):
    # When Resend is not configured, no email should be sent (no SMTP fallback)
    ok, err = email_sender.send_html_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="demo", related_id="d-1",
    )
    assert ok is False
    assert "Resend is not configured" in err
    events = db.get_email_events(related_type="demo", related_id="d-1")
    assert len(events) == 1
    assert events[0]["event"] == "failed"


def test_resend_is_used_when_configured(db, monkeypatch):
    """When Resend is configured, it should be used (no SMTP fallback exists)."""
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


def test_resend_failure_does_not_fall_back_to_smtp(db, monkeypatch):
    # When Resend fails, there is NO SMTP fallback - email fails
    monkeypatch.setenv("RESEND_API_KEY", "re_123")

    monkeypatch.setattr(email_sender, "_send_resend", lambda *a, **k: (False, "resend down", ""))
    ok, err = email_sender.send_html_email("a@b.c", "Subject", "<p>Hi</p>")
    assert ok is False
    assert "resend down" in err


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
