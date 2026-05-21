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
import uuid
from datetime import datetime, timedelta, timezone

from backend.database import (
    get_consent_by_id,
    update_consent_status,
    write_audit,
)

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
    token = str(uuid.uuid4())
    updated = update_consent_status(
        consent_id,
        "PENDING",
        magic_token=token,
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
    return updated


def record_view(consent_id: str, ip: str | None = None) -> dict:
    """Record that the consent link was opened (PENDING -> VIEWED)."""
    consent = get_consent_by_id(consent_id)
    if not consent:
        raise ValueError("Consent not found")
    consent = check_and_expire(consent)
    if consent["status"] == "PENDING":
        now = datetime.now(timezone.utc).isoformat()
        consent = update_consent_status(consent_id, "VIEWED", viewed_at=now)
        write_audit(None, "recipient", "CONSENT_VIEWED", "consent", consent_id, ip=ip)
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
    updated = update_consent_status(
        consent_id,
        "ACCEPTED",
        signature_name=signature_name,
        signature_ip=ip,
        accepted_at=now,
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
    updated = update_consent_status(consent_id, "DECLINED", declined_at=now)
    write_audit(None, "recipient", "CONSENT_DECLINED", "consent", consent_id, ip=ip)
    return updated


def revoke_consent(consent_id: str, ip: str | None = None) -> dict:
    """Transition ACCEPTED -> REVOKED."""
    consent = get_consent_by_id(consent_id)
    if not consent:
        raise ValueError("Consent not found")
    if consent["status"] != "ACCEPTED":
        raise ValueError(f"Cannot revoke consent in status {consent['status']}")

    now = datetime.now(timezone.utc).isoformat()
    updated = update_consent_status(consent_id, "REVOKED", revoked_at=now)
    write_audit(None, "recipient", "CONSENT_REVOKED", "consent", consent_id, ip=ip)
    return updated
