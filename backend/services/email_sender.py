import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from backend.database import create_email_event
from backend.secrets_manager import get_secret


def is_resend_configured() -> bool:
    return bool(get_secret("RESEND_API_KEY"))


def is_smtp_configured() -> bool:
    return bool(get_secret("SMTP_USER")) and bool(get_secret("SMTP_PASSWORD"))


def get_email_from() -> str:
    return os.getenv("EMAIL_FROM", "MindGuard <noreply@mindguard.ai>")


def _send_smtp(to_email: str, subject: str, body_html: str) -> tuple[bool, str]:
    if not is_smtp_configured():
        return False, "SMTP is not configured. Set SMTP_USER and SMTP_PASSWORD in .env."

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = get_secret("SMTP_USER")
    smtp_password = get_secret("SMTP_PASSWORD")

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = get_email_from()
        msg["To"] = to_email
        msg.attach(MIMEText(body_html, "html", "utf-8"))

        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(get_email_from(), to_email, msg.as_string())

        return True, ""
    except Exception as exc:
        return False, str(exc)


def _send_resend(to_email: str, subject: str, body_html: str) -> tuple[bool, str, str]:
    """Send via Resend (Brief §9 email delivery). Returns (ok, error, esp_message_id)."""
    import httpx

    api_key = get_secret("RESEND_API_KEY")
    if not api_key:
        return False, "Resend is not configured. Set RESEND_API_KEY in .env.", ""

    try:
        with httpx.Client(timeout=20) as client:
            resp = client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "from": get_email_from(),
                    "to": [to_email],
                    "subject": subject,
                    "html": body_html,
                },
            )
        if resp.status_code >= 300:
            return False, f"Resend API error {resp.status_code}: {resp.text[:300]}", ""
        return True, "", resp.json().get("id", "")
    except Exception as exc:
        return False, str(exc), ""


def send_html_email(
    to_email: str,
    subject: str,
    body_html: str,
    related_type: str | None = None,
    related_id: str | None = None,
    metadata: dict | None = None,
) -> tuple[bool, str]:
    """Send an HTML email, preferring Resend and falling back to SMTP.

    When ``related_type``/``related_id`` are provided, delivery is logged to the
    ``email_events`` table (append-only deliverability trail, Brief §9).

    Returns ``(ok, error)`` — on success the error slot is empty.
    """
    ok, err, esp_message_id = False, "", ""

    if is_resend_configured():
        ok, err, esp_message_id = _send_resend(to_email, subject, body_html)

    if not ok:
        ok, err = _send_smtp(to_email, subject, body_html)

    if related_type:
        create_email_event(
            related_type=related_type,
            related_id=related_id,
            event="sent" if ok else "failed",
            esp_message_id=esp_message_id or None,
            recipient_email=to_email,
            metadata={**(metadata or {}), **({"error": err} if not ok else {})},
        )

    return ok, err
