"""
user_store.py — MindGuard User Account Management via Supabase Auth
User metadata (role, DOB, referral_code, etc.) is stored in Supabase Auth user_metadata.
No custom DB table required — Supabase Auth handles password hashing and storage.

Prerequisites:
  - SUPABASE_URL and SUPABASE_ANON_KEY set in .env
  - In Supabase Dashboard → Authentication → Settings:
      Disable "Enable email confirmations" for local/school use
      (otherwise sign_in will fail until the user clicks a confirmation link)
"""

import datetime
import os
import random
import string


# Mirror auth.py's _load_env so env vars are available at import time.
def _load_env(path: str = ".env") -> None:
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except FileNotFoundError:
        pass


_load_env()


def _get_client():
    from supabase import create_client
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")
    return create_client(url, key)


def _generate_referral_code(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


def _compute_age(dob_str: str):
    if not dob_str:
        return None
    try:
        dob = datetime.date.fromisoformat(dob_str)
        today = datetime.date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except (ValueError, AttributeError):
        return None


def register_user(
    email: str,
    name: str,
    password: str,
    role: str,
    dob_str: str = "",
    parent_email: str = "",
    referred_by: str = "",
) -> tuple:
    """
    Register a new user via Supabase Auth.
    role: "student" | "counselor" | "admin"
    Extra fields stored in Supabase Auth user_metadata.
    Returns (success: bool, message: str).
    """
    email = email.strip().lower()
    role = role.strip().lower()

    if not email or not name or not password:
        return False, "Email, name, and password are required."

    if role not in ("student", "counselor", "admin"):
        role = "counselor"

    age = _compute_age(dob_str)
    is_minor = (age is not None and age < 18) if role == "student" else False

    metadata = {
        "name": name.strip(),
        "role": role,
        "dob": dob_str,
        "is_minor": is_minor,
        "parent_email": parent_email.strip() if (is_minor and parent_email) else "",
        "referral_code": _generate_referral_code(),
        "referred_by": referred_by.strip(),
    }

    try:
        client = _get_client()
        response = client.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": metadata},
        })
        if response.user:
            return True, "Registration successful."
        # Supabase returns user=None when email confirmation is pending
        return False, (
            "Account created but email confirmation is required. "
            "Check your inbox — or disable email confirmation in Supabase Dashboard → "
            "Authentication → Settings."
        )
    except Exception as e:
        err = str(e)
        err_lower = err.lower()
        if "already registered" in err_lower or "user already registered" in err_lower:
            return False, "An account with this email already exists."
        if "database error saving new user" in err_lower or (
            hasattr(e, "code") and getattr(e, "code", "") == "unexpected_failure"
        ):
            return False, (
                "Supabase database error — a broken trigger is blocking registration. "
                "Fix: open your Supabase Dashboard → SQL Editor and run:\n\n"
                "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;\n"
                "DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;\n\n"
                "Then try registering again."
            )
        if "password" in err_lower and ("weak" in err_lower or "short" in err_lower or "characters" in err_lower):
            return False, "Password is too weak. Use at least 8 characters including a number."
        return False, f"Registration error: {err}"


def authenticate_user(email: str, password: str) -> dict | None:
    """
    Sign in via Supabase Auth.
    Returns a normalised user dict or None on failure.
    """
    try:
        client = _get_client()
        response = client.auth.sign_in_with_password({"email": email, "password": password})
        if not response.user:
            return None
        meta = response.user.user_metadata or {}
        return {
            "email": response.user.email,
            "name": meta.get("name", email.split("@")[0]),
            "role": meta.get("role", "counselor"),
            "dob": meta.get("dob", ""),
            "is_minor": meta.get("is_minor", False),
            "parent_email": meta.get("parent_email", ""),
            "referral_code": meta.get("referral_code", ""),
            "referred_by": meta.get("referred_by", ""),
        }
    except Exception:
        return None


def get_user(email: str) -> dict | None:
    """
    With the anon key we can't look up arbitrary users.
    Callers should use data returned by authenticate_user() and stored in session state.
    """
    return None


def update_user(email: str, updates: dict) -> None:
    """
    Update the currently-active Supabase Auth session's user_metadata.
    Only works while the user has an active session — pass metadata during
    register_user() whenever possible instead.
    """
    try:
        client = _get_client()
        client.auth.update_user({"data": updates})
    except Exception:
        pass
