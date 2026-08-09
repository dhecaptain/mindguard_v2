import logging
import os
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from backend.database import create_email_event
from backend.secrets_manager import get_secret

logger = logging.getLogger(__name__)

# Consumer mail providers can't be used as a verified ESP sender domain — the
# "from" address must be one the ESP (Resend, SES, ...) has verified for you.
# A personal Gmail as the consent/alert sender silently breaks deliverability
# (or worse, leaks a staff member's private address to every parent).
_PERSONAL_FROM_PATTERN = re.compile(
    r"@(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|icloud|me|aol|protonmail|proton|zoho)\.", re.IGNORECASE
)
_personal_from_warned = False


def is_resend_configured() -> bool:
    return bool(get_secret("RESEND_API_KEY"))


def is_smtp_configured() -> bool:
    return bool(get_secret("SMTP_USER")) and bool(get_secret("SMTP_PASSWORD"))


def get_email_from() -> str:
    """Resolve the sender address, falling back to the committed default.

    ``EMAIL_FROM`` is operator config (set in prod to a verified sender domain);
    the code never falls back to a staff member's personal address. A warning is
    logged (once) if the configured value looks like a consumer-mail account.
    """
    value = os.getenv("EMAIL_FROM") or "MindGuard <noreply@mindguard.ai>"
    global _personal_from_warned
    if _PERSONAL_FROM_PATTERN.search(value) and not _personal_from_warned:
        _personal_from_warned = True
        logger.warning(
            "EMAIL_FROM (%s) looks like a personal/consumer mail address. "
            "Consent and alert emails may be blocked, and recipient replies go to a "
            "private inbox. Set EMAIL_FROM to a verified domain you control, e.g. "
            "MindGuard <no-reply@your-school-domain.org>.",
            value,
        )
    return value


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
