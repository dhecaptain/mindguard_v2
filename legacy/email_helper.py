"""
DEPRECATED — use backend/services/email_sender.py (Resend central service).

This stub preserves imports for legacy callers but delegates to Resend.
No SMTP transport remains.
"""


def is_smtp_configured() -> bool:
    return False


def send_email(to_email: str, subject: str, body_html: str) -> tuple:
    from backend.services.email_sender import send_html_email

    ok, err = send_html_email(to_email, subject, body_html, related_type="legacy", related_id=None)
    return ok, err


def send_parent_notification(parent_email: str, student_name: str, student_email: str) -> tuple:
    from backend.services.email_sender import send_html_email
    from backend.services.email_templates import parent_consent_request

    subject, body = parent_consent_request(
        {
            "institution_name": "your school",
            "student_first_name": student_name,
            "parent_first_name": "Parent/Guardian",
            "consent_url": "",
        }
    )
    return send_html_email(parent_email, subject, body, related_type="legacy", related_id=None)
