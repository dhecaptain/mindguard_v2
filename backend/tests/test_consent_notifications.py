"""Tests for post-response emails (Brief §4.5 confirmation + §4.6 admin notification)."""

from backend.services import consent_service


def _seed(db) -> dict:
    counsellor = db.create_user("counsellor@school.edu", "Counsellor", "x", role_type="counsellor")
    student = db.create_user("student@school.edu", "Student", "x", role_type="student")
    consent = db.create_consent(student["id"], counsellor["id"], "student@school.edu", "student", ["reddit"])
    updated = consent_service.dispatch_consent(consent["id"], counsellor["id"])
    return {"counsellor": counsellor, "student": student, "consent": updated}


def test_accept_sends_confirmation_and_admin_notification(monkeypatch, db):
    s = _seed(db)
    sent = []

    def fake_send(to, subject, body, **kwargs):
        sent.append((to, subject, body, kwargs))
        return True, ""

    monkeypatch.setattr(consent_service, "send_html_email", fake_send)

    accepted = consent_service.accept_consent(s["consent"]["id"], "Student", "1.2.3.4")
    assert accepted["status"] == "ACCEPTED"
    assert len(sent) == 2

    recipient = [x for x in sent if x[0] == "student@school.edu"][0]
    admin = [x for x in sent if x[0] == "counsellor@school.edu"][0]

    assert recipient[1] == "Thank you — your consent is recorded"
    assert recipient[3]["related_id"] == s["consent"]["id"]
    assert recipient[3]["metadata"]["kind"] == "confirmation"
    assert recipient[3]["metadata"]["status"] == "ACCEPTED"

    assert admin[1] == "Consent update — Student responded"
    assert admin[3]["metadata"]["kind"] == "admin_notification"
    assert admin[3]["metadata"]["status"] == "ACCEPTED"
    assert "#consent-tracker" in admin[2]


def test_decline_sends_confirmation_and_admin_notification(monkeypatch, db):
    s = _seed(db)
    sent = []

    def fake_send(to, subject, body, **kwargs):
        sent.append((to, subject))
        return True, ""

    monkeypatch.setattr(consent_service, "send_html_email", fake_send)

    declined = consent_service.decline_consent(s["consent"]["id"], "1.2.3.4")
    assert declined["status"] == "DECLINED"

    recipients = {to: subj for to, subj in sent}
    assert recipients["student@school.edu"] == "Thank you for your response"
    assert recipients["counsellor@school.edu"] == "Consent update — Student responded"


def test_confirmation_failure_does_not_block_acceptance(monkeypatch, db):
    s = _seed(db)

    def fake_send(to, subject, body, **kwargs):
        return False, "SMTP is not configured"

    monkeypatch.setattr(consent_service, "send_html_email", fake_send)

    accepted = consent_service.accept_consent(s["consent"]["id"], "Student", "1.2.3.4")
    assert accepted["status"] == "ACCEPTED"


def test_admin_notification_skipped_when_counsellor_unresolved(monkeypatch, db):
    s = _seed(db)
    sent = []

    def fake_send(to, subject, body, **kwargs):
        sent.append(to)
        return True, ""

    monkeypatch.setattr(consent_service, "send_html_email", fake_send)
    monkeypatch.setattr(consent_service, "get_user_by_id", lambda uid: None)

    consent_service.accept_consent(s["consent"]["id"], "Student", "1.2.3.4")
    assert sent == ["student@school.edu"]
