"""Tests for the email template builders (Brief §4.1–4.8)."""

import pytest

from services import email_templates as et

# Context keys every template needs for its footer.
_FOOTER_KEYS = {
    "withdraw_url": "https://example.com/withdraw",
    "privacy_url": "https://example.com/privacy",
    "contact_url": "https://example.com/contact",
}


def _ctx(**overrides) -> dict:
    ctx = {
        "institution_name": "Riverside High",
        "student_first_name": "Ava",
        "student_last_name": "Chen",
        "parent_first_name": "Mei",
        "counsellor_email": "counsellor@riverside.edu",
        "consent_url": "https://example.com/consent/tok123",
        "full_name": "Jordan Blake",
        "work_email": "jordan@acme.org",
        "organisation": "Acme Learning Trust",
        "organisation_type": "Non-profit",
        "role_title": "Head of Pastoral Care",
        "country": "UK",
        "student_count_range": "1,001–5,000",
        "heard_about_us": "Conference",
        "message": "We'd love a walkthrough.",
        "status": "ACCEPTED",
        "tracker_url": "https://app.example.com/tracker",
        "admin_url": "https://app.example.com/admin/demo",
        "docs_url": "https://mindguard.ai/docs",
    }
    ctx.update(_FOOTER_KEYS)
    ctx.update(overrides)
    return ctx


def _assert_email(subject: str, html: str):
    assert subject and html
    assert "<html" in html and "</html>" in html
    assert html.startswith("<!DOCTYPE html>")


def test_all_template_functions_registered():
    names = [
        "student_consent_request",
        "parent_consent_request",
        "student_courtesy_copy",
        "consent_reminder",
        "consent_confirmation",
        "admin_consent_notification",
        "demo_request_confirmation",
        "demo_request_notification",
    ]
    for n in names:
        assert callable(getattr(et, n))


@pytest.mark.parametrize(
    "fn_name",
    [
        "student_consent_request",
        "parent_consent_request",
        "student_courtesy_copy",
        "consent_confirmation",
        "admin_consent_notification",
        "demo_request_confirmation",
        "demo_request_notification",
    ],
)
def test_templates_produce_valid_email(fn_name):
    fn = getattr(et, fn_name)
    kwargs = {}
    if fn_name == "consent_confirmation":
        kwargs["accepted"] = True
    subject, html = fn(_ctx(), **kwargs)
    _assert_email(subject, html)


def test_reminder_day_variant():
    d3_subject, d3_html = et.consent_reminder(_ctx(), day=3)
    d7_subject, d7_html = et.consent_reminder(_ctx(), day=7)
    assert "Last few days" in d7_subject
    assert "Last few days" not in d3_subject
    assert "gentle reminder" in d3_subject.lower()
    _assert_email(d3_subject, d3_html)
    _assert_email(d7_subject, d7_html)


def test_confirmation_accepted_vs_declined():
    _, acc = et.consent_confirmation(_ctx(), accepted=True)
    _, dec = et.consent_confirmation(_ctx(), accepted=False)
    assert "consent is recorded" in acc
    assert "will not be included" in dec


def test_consent_request_contains_institution_and_url():
    _, html = et.student_consent_request(_ctx())
    assert "Riverside High" in html
    assert "https://example.com/consent/tok123" in html
    assert "Withdraw consent" in html


def test_demo_notification_lists_fields():
    _, html = et.demo_request_notification(_ctx())
    for field in ("Work email", "Organisation", "Country", "Heard about us", "jordan@acme.org"):
        assert field in html


def test_escaping_prevents_html_injection():
    _, html = et.student_consent_request(_ctx(student_first_name="<script>alert(1)</script>"))
    assert "<script>alert(1)</script>" not in html
    assert "&lt;script&gt;" in html


def test_admin_notification_shows_status():
    _, html = et.admin_consent_notification(_ctx(status="DECLINED"))
    assert "DECLINED" in html
    assert "tracker" in html.lower()


def test_parent_request_mentions_under_18():
    _, html = et.parent_consent_request(_ctx())
    assert "under 18" in html
