"""Demo request pipeline helpers (Delivery Brief §6).

Kept free of heavyweight imports so it stays unit-testable without the
ML stack (torch is not installed in CI/dev everywhere).
"""

import os

FREE_EMAIL_DOMAINS = {
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "hotmail.com",
    "outlook.com", "live.com", "icloud.com", "me.com", "aol.com", "proton.me",
    "protonmail.com", "gmx.com", "gmx.net", "mail.com", "zoho.com", "yandex.com",
}


def app_base_url() -> str:
    return (os.getenv("APP_BASE_URL") or os.getenv("FRONTEND_URL") or "http://localhost:5173").rstrip("/")


def work_email_warning(email: str) -> str | None:
    """Soft-warn when the requester used a personal email provider (Brief §6)."""
    domain = (email or "").rsplit("@", 1)[-1].strip().lower()
    if domain in FREE_EMAIL_DOMAINS:
        return (
            "That looks like a personal email address — you may get a faster "
            "response using your work or school email."
        )
    return None


def demo_email_context(demo: dict) -> dict:
    base = app_base_url()
    return {
        "full_name": demo["full_name"],
        "work_email": demo["work_email"],
        "organisation": demo["organisation"],
        "organisation_type": demo["organisation_type"],
        "role_title": demo.get("role_title") or "",
        "country": demo.get("country") or "",
        "student_count_range": demo.get("student_count_range") or "",
        "heard_about_us": demo.get("heard_about_us") or "",
        "message": demo.get("message") or "",
        "docs_url": f"{base}/docs",
        "admin_url": f"{base}/admin",
        "withdraw_url": f"{base}/privacy",
        "privacy_url": f"{base}/privacy",
        "contact_url": f"{base}/contact",
    }
