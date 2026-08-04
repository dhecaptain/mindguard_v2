"""Consent enforcement gate for analysis paths (Delivery Brief §7).

When ``ENFORCE_CONSENT_ANALYSIS`` is on (default), running analysis on a
student's content requires an ACCEPTED, non-expired consent on record.
"""

import logging
from datetime import datetime, timezone

from fastapi import HTTPException

from backend.config import CONSENT_EXPIRY_DAYS, ENFORCE_CONSENT_ANALYSIS
from backend.database import get_consents_by_student

logger = logging.getLogger(__name__)


def get_active_consent(user_id: str) -> dict | None:
    """Return the most recent ACCEPTED, non-expired consent for a student user."""
    consents = get_consents_by_student(user_id)
    if not consents:
        return None
    now = datetime.now(timezone.utc).isoformat()
    for consent in consents:
        if consent.get("status") != "ACCEPTED":
            continue
        expires_at = consent.get("expires_at")
        if expires_at and expires_at <= now:
            continue
        return consent
    return None


def is_consent_enforced() -> bool:
    return ENFORCE_CONSENT_ANALYSIS


def require_consent_for_analysis(user_id: str) -> dict | None:
    """Raise 403 when analysis is consent-gated and the student lacks active consent."""
    if not ENFORCE_CONSENT_ANALYSIS:
        return None
    consent = get_active_consent(user_id)
    if not consent:
        raise HTTPException(
            403,
            "Analysis is consent-gated: this student has no active (accepted, non-expired) "
            "consent on record. Dispatch and obtain consent before running analysis.",
        )
    return consent


def consent_status_for_ui(user_id: str) -> dict:
    """Lightweight status snapshot for dashboards/tracker UI."""
    if not ENFORCE_CONSENT_ANALYSIS:
        return {"enforced": False, "active": True}
    consent = get_active_consent(user_id)
    return {
        "enforced": True,
        "active": consent is not None,
        "consent_id": consent["id"] if consent else None,
        "expires_at": consent["expires_at"] if consent else None,
        "expiry_days": CONSENT_EXPIRY_DAYS,
    }
