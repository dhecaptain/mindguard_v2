"""ESP webhook verification + event processing (Delivery Brief §6/§9.4/§13).

Resend (the primary ESP) delivers webhooks using the Svix signature scheme:
``svix-id`` / ``svix-timestamp`` / ``svix-signature`` headers plus a ``whsec_``
signing secret. The signed content is ``f"{svix_id}.{svix_timestamp}.{body}"``
with the *raw* request body (unmodified) and HMAC-SHA256 keyed on the
base64-decoded portion of the secret. Signatures older than the tolerance
window are rejected to prevent replay attacks.
"""
import base64
import hashlib
import hmac
import json
import logging
import time

from backend.database import create_email_event, get_email_events_by_esp_message_id

logger = logging.getLogger(__name__)

# ESP event type -> short delivery outcome recorded in email_events.
_WEBHOOK_EVENTS = {
    "email.delivered": "delivered",
    "email.bounced": "bounced",
    "email.complained": "complained",
    "email.clicked": "clicked",
    "email.opened": "opened",
    "email.delivery_delayed": "delivery_delayed",
}

# Outcomes that matter for deliverability dashboards/badges.
_DELIVERY_OUTCOMES = {"delivered", "bounced", "complained"}


def verify_webhook_signature(
    payload: str,
    headers: dict,
    secret: str,
    tolerance_seconds: int = 300,
) -> bool:
    """Verify a Svix-style (Resend) webhook signature.

    Fails closed: without a configured secret, missing headers, a stale
    timestamp, or a non-matching signature all return ``False``.
    """
    if not secret:
        logger.warning("webhook verification skipped: RESEND_WEBHOOK_SECRET not set")
        return False

    msg_id = (headers.get("svix-id") or "").strip()
    timestamp = (headers.get("svix-timestamp") or "").strip()
    signature_header = headers.get("svix-signature") or ""
    if not (msg_id and timestamp and signature_header):
        return False

    try:
        ts = int(timestamp)
    except (TypeError, ValueError):
        return False
    if abs(time.time() - ts) > tolerance_seconds:
        logger.warning("webhook timestamp outside tolerance window: %s", timestamp)
        return False

    try:
        key = base64.b64decode(secret.removeprefix("whsec_"))
    except Exception:
        return False

    signed_content = f"{msg_id}.{timestamp}.{payload}".encode()
    expected = base64.b64encode(
        hmac.new(key, signed_content, hashlib.sha256).digest()
    ).decode()

    # Header holds one or more space-delimited entries: "v1,<base64> v1,<base64>".
    for entry in signature_header.split(" "):
        entry = entry.strip()
        if not entry:
            continue
        version, _, sig = entry.partition(",")
        if not version.startswith("v"):
            continue
        if hmac.compare_digest(sig, expected):
            return True
    return False


def _first_recipient(to) -> str | None:
    if isinstance(to, list):
        return to[0] if to else None
    return to or None


def process_email_event(payload: dict) -> dict:
    """Record an ESP delivery event against the matching send(s).

    Correlates on the ESP's ``data.email_id`` (= ``esp_message_id`` in
    ``email_events``). Bounces/complaints/deliveries are appended to the
    event trail so the tracker/drawer can show the latest delivery outcome.
    Idempotent: re-delivered webhooks (Svix retries) do not duplicate rows.

    Returns a small summary dict for the HTTP response / tests.
    """
    event_type = payload.get("type", "")
    outcome = _WEBHOOK_EVENTS.get(event_type)
    if outcome is None:
        return {"processed": 0, "event": event_type, "matched": False, "reason": "unsupported"}

    data = payload.get("data") or {}
    email_id = data.get("email_id")
    recipient = _first_recipient(data.get("to"))
    created_at = data.get("created_at")

    if not email_id:
        return {"processed": 0, "event": event_type, "matched": False, "reason": "missing email_id"}

    matches = get_email_events_by_esp_message_id(email_id)
    if not matches:
        return {"processed": 0, "event": event_type, "matched": False, "reason": "unknown message id"}

    already_recorded = {m["event"] for m in matches if m["event"] in _DELIVERY_OUTCOMES}
    if outcome in already_recorded:
        return {"processed": 0, "event": event_type, "matched": True, "reason": "duplicate"}

    # Correlate against the original send records; derived webhook rows are
    # the same delivery, not additional recipients to record against.
    sends = [m for m in matches if m["event"] in ("sent", "failed")]
    if not sends:
        sends = matches

    recorded = 0
    for m in sends:
        # Keep the bounce/complaint visible on the original send context.
        create_email_event(
            related_type=m["related_type"],
            related_id=m["related_id"],
            event=outcome,
            esp_message_id=email_id,
            recipient_email=recipient or m["recipient_email"],
            metadata={
                "esp_event": event_type,
                **({"received_at": created_at} if created_at else {}),
            },
        )
        recorded += 1

    if outcome in _DELIVERY_OUTCOMES:
        logger.info(
            "email %s -> %s for %s/%s",
            email_id, outcome, m["related_type"], m["related_id"],
        )
    return {"processed": recorded, "event": event_type, "matched": True, "reason": "ok"}


def handle_webhook(raw_body: str, headers: dict, secret: str, tolerance_seconds: int = 300) -> dict:
    """Full webhook pipeline: verify, parse, process.

    Raises ``ValueError`` on an invalid signature (caller maps to HTTP 401)
    or ``json.JSONDecodeError`` on a malformed body.
    """
    if not verify_webhook_signature(raw_body, headers, secret, tolerance_seconds):
        raise ValueError("Invalid webhook signature")
    payload = json.loads(raw_body)
    return process_email_event(payload)
