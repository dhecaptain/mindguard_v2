"""
Consent state machine operations.
Valid transitions:
  DRAFT -> PENDING (dispatch)
  PENDING -> VIEWED (token opened)
  PENDING|VIEWED -> ACCEPTED (accepted)
  PENDING|VIEWED -> DECLINED (declined)
  PENDING|VIEWED -> EXPIRED (TTL elapsed - checked on read)
  ACCEPTED -> REVOKED (revoked)
  ACCEPTED -> RENEWAL_DUE (auto on expiry)
"""
import json
import logging
import os
from datetime import datetime, timedelta, timezone

from backend.database import (
    create_consent_event,
    get_consent_by_id,
    get_consent_events,
    get_all_consents,
    update_consent_status,
    write_audit,
)
from backend.config import CONSENT_EXPIRY_DAYS, CONSENT_REMINDER_DAYS
from backend.services.crypto import create_signed_token, hash_token, verify_signed_token
from backend.services.email_sender import send_html_email
from backend.services.email_templates import consent_reminder

logger = logging.getLogger(__name__)

# Maximum portal page loads a single consent link allows (Delivery Brief §5).
MAX_CONSENT_VIEWS = 20

CONSENT_TRANSITIONS = {
    "DRAFT":       ["PENDING"],
    "PENDING":     ["VIEWED", "ACCEPTED", "DECLINED", "EXPIRED"],
    "VIEWED":      ["ACCEPTED", "DECLINED", "EXPIRED"],
    "ACCEPTED":    ["REVOKED", "RENEWAL_DUE"],
    "DECLINED":    ["PENDING"],  # re-dispatch
    "EXPIRED":     ["PENDING"],  # re-dispatch
    "REVOKED":     [],
    "RENEWAL_DUE": ["PENDING"],
}


def _consent_url(token: str) -> str:
    base_url = os.getenv("APP_BASE_URL") or os.getenv("FRONTEND_URL") or "http://localhost:5173"
    return f"{base_url.rstrip('/')}/consent/{token}"


def verify_consent_token(consent: dict, token: str) -> bool:
    """Validate a portal token against the consent record.

    Signed tokens (``v1.``) are verified with the HMAC; legacy plain-UUID
    tokens are accepted for backwards compatibility with pre-M3 records.
    """
    token = str(token or "")
    if not token or consent.get("magic_token") != token:
        return False
    if token.startswith("v1."):
        return verify_signed_token(token, consent["id"])
    return len(token) == 36  # legacy uuid4 magic token


def view_count(consent_id: str) -> int:
    """Number of times the consent portal has been opened."""
    events = get_consent_events(consent_id) or []
    return sum(1 for e in events if e.get("event_type") == "viewed")


def remaining_views(consent_id: str) -> int:
    return max(0, MAX_CONSENT_VIEWS - view_count(consent_id))


def _send_consent_email(consent: dict, reminder: bool = False) -> tuple[bool, str, str]:
    token = consent.get("magic_token") or ""
    url = _consent_url(token)
    platforms = ", ".join(json.loads(consent.get("platforms_json") or "[]")) or "selected platforms"
    role_label = "parent/guardian" if consent.get("recipient_role") == "parent" else "student"
    subject_prefix = "Reminder: " if reminder else ""
    subject = f"{subject_prefix}MindGuard consent request"
    body_html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#111827;max-width:640px;margin:0 auto;padding:24px;background:#f7f9fb">
  <div style="background:#0F766E;border-radius:10px 10px 0 0;padding:24px 28px">
    <h1 style="color:#ffffff;margin:0;font-size:22px">MindGuard</h1>
    <p style="color:#ccfbf1;margin:6px 0 0;font-size:14px">Consent request for social media wellbeing analysis</p>
  </div>
  <div style="background:#ffffff;border:1px solid #d9e3df;border-top:none;border-radius:0 0 10px 10px;padding:28px">
    <p>Dear {role_label},</p>
    <p>A school counsellor has requested consent to analyse public social media information using MindGuard.</p>
    <p><strong>Requested platforms:</strong> {platforms}</p>
    <p><strong>Consent mode:</strong> {consent.get("mode", "ON_DEMAND").replace("_", " ").title()}</p>
    <p style="margin:24px 0">
      <a href="{url}" style="background:#0F766E;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;display:inline-block">
        Review consent request
      </a>
    </p>
    <p>If the button does not work, copy and paste this link into your browser:</p>
    <p style="word-break:break-all;color:#0F766E">{url}</p>
    <p style="font-size:13px;color:#64748b">This link expires automatically. You can accept or decline from the consent page.</p>
  </div>
</body>
</html>
"""
    ok, error = send_html_email(consent["recipient_email"], subject, body_html)
    return ok, error, url


def check_and_expire(consent: dict) -> dict:
    """If PENDING/VIEWED and past expires_at, flip to EXPIRED."""
    if consent["status"] not in ("PENDING", "VIEWED"):
        return consent
    expires = consent.get("expires_at")
    if expires and datetime.now(timezone.utc).isoformat() > expires:
        consent = update_consent_status(consent["id"], "EXPIRED") or consent
    return consent


def dispatch_consent(consent_id: str, actor_id: str, ip: str | None = None) -> dict:
    """Transition DRAFT/DECLINED/EXPIRED/RENEWAL_DUE -> PENDING.

    Generates a fresh magic token, refreshes expires_at, and records dispatched_at.
    """
    consent = get_consent_by_id(consent_id)
    if not consent:
        raise ValueError("Consent not found")
    consent = check_and_expire(consent)
    allowed = CONSENT_TRANSITIONS.get(consent["status"], [])
    if "PENDING" not in allowed:
        raise ValueError(f"Cannot dispatch consent in status {consent['status']}")

    now = datetime.now(timezone.utc)
    token = create_signed_token(consent_id)
    updated = update_consent_status(
        consent_id,
        "PENDING",
        magic_token=token,
        signed_token_hash=hash_token(token),
        magic_token_expires_at=(now + timedelta(hours=72)).isoformat(),
        expires_at=(now + timedelta(days=7)).isoformat(),
        dispatched_at=now.isoformat(),
    )
    write_audit(
        actor_id,
        "counsellor",
        "CONSENT_DISPATCHED",
        "consent",
        consent_id,
        payload={"recipient": consent["recipient_email"]},
        ip=ip,
    )
    email_sent, email_error, url = _send_consent_email(updated)
    write_audit(
        actor_id,
        "counsellor",
        "CONSENT_EMAIL_SENT" if email_sent else "CONSENT_EMAIL_FAILED",
        "consent",
        consent_id,
        payload={"recipient": updated["recipient_email"], "error": email_error, "url": url},
        ip=ip,
    )
    updated["email_sent"] = email_sent
    updated["email_error"] = email_error
    updated["consent_url"] = url
    return updated


def remind_consent(consent_id: str, actor_id: str, ip: str | None = None) -> dict:
    consent = get_consent_by_id(consent_id)
    if not consent:
        raise ValueError("Consent not found")
    consent = check_and_expire(consent)
    if consent["status"] not in ("PENDING", "VIEWED"):
        raise ValueError(f"Cannot send reminder for consent in status {consent['status']}")

    email_sent, email_error, url = _send_consent_email(consent, reminder=True)
    write_audit(
        actor_id,
        "counsellor",
        "CONSENT_REMINDER_SENT" if email_sent else "CONSENT_REMINDER_FAILED",
        "consent",
        consent_id,
        payload={"recipient": consent["recipient_email"], "error": email_error, "url": url},
        ip=ip,
    )
    consent["email_sent"] = email_sent
    consent["email_error"] = email_error
    consent["consent_url"] = url
    return consent


def record_view(consent_id: str, ip: str | None = None) -> dict:
    """Record that the consent link was opened (PENDING -> VIEWED)."""
    consent = get_consent_by_id(consent_id)
    if not consent:
        raise ValueError("Consent not found")
    consent = check_and_expire(consent)
    if consent["status"] == "PENDING":
        now = datetime.now(timezone.utc).isoformat()
        consent = update_consent_status(consent_id, "VIEWED", viewed_at=now, response_ip=ip)
        write_audit(None, "recipient", "CONSENT_VIEWED", "consent", consent_id, ip=ip)
    create_consent_event(consent_id, "viewed", actor_type="recipient", metadata={"ip": ip})
    return consent


def accept_consent(
    consent_id: str,
    signature_name: str,
    ip: str,
    platforms: list | None = None,
) -> dict:
    """Transition PENDING/VIEWED -> ACCEPTED with signature and optional platform list."""
    consent = get_consent_by_id(consent_id)
    if not consent:
        raise ValueError("Consent not found")
    consent = check_and_expire(consent)
    if consent["status"] not in ("PENDING", "VIEWED"):
        raise ValueError(f"Cannot accept consent in status {consent['status']}")

    now = datetime.now(timezone.utc).isoformat()
    final_platforms = platforms if platforms is not None else json.loads(
        consent.get("platforms_json") or "[]"
    )
    expiry = (
        datetime.now(timezone.utc) + timedelta(days=CONSENT_EXPIRY_DAYS)
    ).isoformat()
    updated = update_consent_status(
        consent_id,
        "ACCEPTED",
        signature_name=signature_name,
        signature_ip=ip,
        accepted_at=now,
        expires_at=expiry,
        response_ip=ip,
        platforms_json=json.dumps(final_platforms),
    )
    write_audit(
        None,
        "recipient",
        "CONSENT_ACCEPTED",
        "consent",
        consent_id,
        payload={"signature": signature_name},
        ip=ip,
    )
    create_consent_event(consent_id, "accepted", actor_type="recipient",
                         metadata={"signature": signature_name, "ip": ip})
    return updated


def decline_consent(consent_id: str, ip: str | None = None) -> dict:
    """Transition PENDING/VIEWED -> DECLINED."""
    consent = get_consent_by_id(consent_id)
    if not consent:
        raise ValueError("Consent not found")
    consent = check_and_expire(consent)
    if consent["status"] not in ("PENDING", "VIEWED"):
        raise ValueError(f"Cannot decline consent in status {consent['status']}")

    now = datetime.now(timezone.utc).isoformat()
    updated = update_consent_status(consent_id, "DECLINED", declined_at=now, response_ip=ip)
    write_audit(None, "recipient", "CONSENT_DECLINED", "consent", consent_id, ip=ip)
    create_consent_event(consent_id, "declined", actor_type="recipient", metadata={"ip": ip})
    return updated


def revoke_consent(consent_id: str, ip: str | None = None) -> dict:
    """Transition ACCEPTED -> REVOKED."""
    consent = get_consent_by_id(consent_id)
    if not consent:
        raise ValueError("Consent not found")
    if consent["status"] != "ACCEPTED":
        raise ValueError(f"Cannot revoke consent in status {consent['status']}")

    now = datetime.now(timezone.utc).isoformat()
    updated = update_consent_status(consent_id, "REVOKED", revoked_at=now, response_ip=ip)
    write_audit(None, "recipient", "CONSENT_REVOKED", "consent", consent_id, ip=ip)
    create_consent_event(consent_id, "revoked", actor_type="recipient", metadata={"ip": ip})
    return updated


# ── Batch maintenance (scheduler) ─────────────────────────────────────

def _footer_urls(token: str) -> dict:
    base = (os.getenv("APP_BASE_URL") or os.getenv("FRONTEND_URL") or "http://localhost:5173").rstrip("/")
    return {
        "withdraw_url": f"{base}/consent/{token}",
        "privacy_url": f"{base}/privacy",
        "contact_url": f"{base}/contact",
    }


def _reminder_context(consent: dict) -> dict:
    ctx = {
        "institution_name": consent.get("notes") or "your school",
        "student_first_name": consent.get("student_name") or "there",
        "counsellor_email": "counsellor@mindguard.app",
        "consent_url": _consent_url(consent["magic_token"]),
    }
    ctx.update(_footer_urls(consent["magic_token"]))
    return ctx


def process_expired_consents() -> int:
    """Flip PENDING/VIEWED consents past expires_at to EXPIRED. Returns count."""
    changed = 0
    for consent in get_all_consents():
        if consent["status"] not in ("PENDING", "VIEWED"):
            continue
        expires = consent.get("expires_at")
        if expires and datetime.now(timezone.utc).isoformat() > expires:
            update_consent_status(consent["id"], "EXPIRED")
            create_consent_event(consent["id"], "expired", actor_type="system")
            changed += 1
    return changed


def process_consent_reminders(now: datetime | None = None) -> dict:
    """Send day-3/day-7 reminders for pending consents. Returns a summary.

    Reminder n is sent when ``dispatched_at`` is at least ``CONSENT_REMINDER_DAYS[n]``
    days old and fewer than n+1 reminders have already been sent.
    """
    now = now or datetime.now(timezone.utc)
    days = sorted(CONSENT_REMINDER_DAYS)
    sent, failed = [], []
    for consent in get_all_consents():
        if consent["status"] not in ("PENDING", "VIEWED"):
            continue
        dispatched = consent.get("dispatched_at")
        if not dispatched:
            continue
        try:
            elapsed = (now - datetime.fromisoformat(dispatched)).days
        except (ValueError, TypeError):
            continue
        already = int(consent.get("reminders_sent") or 0)
        for index, target_day in enumerate(days):
            if elapsed >= target_day and already <= index:
                ok, err = _send_reminder_for(consent, target_day, already + 1)
                (sent if ok else failed).append(consent["id"])
                break
    return {"sent": len(sent), "failed": len(failed), "sent_ids": sent, "failed_ids": failed}


def _send_reminder_for(consent: dict, day: int, new_count: int) -> tuple[bool, str]:
    subject, html = consent_reminder(_reminder_context(consent), day=day)
    ok, err = send_html_email(
        consent["recipient_email"],
        subject,
        html,
        related_type="consent",
        related_id=consent["id"],
        metadata={"kind": f"reminder_day_{day}"},
    )
    if ok:
        update_consent_status(
            consent["id"], consent["status"],
            reminders_sent=new_count,
        )
        create_consent_event(
            consent["id"], "reminder_sent", actor_type="system",
            metadata={"day": day, "reminders_sent": new_count},
        )
    else:
        logger.warning("consent reminder %s failed: %s", consent["id"], err)
    return ok, err
