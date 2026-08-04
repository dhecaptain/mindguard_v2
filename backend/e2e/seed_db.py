"""Seed a fresh SQLite DB for the Playwright e2e suite (Delivery Brief §9.3).

Invoked by the Playwright global setup. Playwright boots the backend
webServer BEFORE global-setup runs, so the API may have already created an
empty schema; this script therefore wipes every table and reseeds, giving
each run a deterministic starting state. The seed and the server share
MINDGUARD_DB_DIR / JWT_SECRET / ENCRYPTION_KEY so the booted API sees exactly
the seeded state.

Usage: python backend/e2e/seed_db.py <db_dir>
"""

import os
import sys
from pathlib import Path

DB_DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".e2e-db")

# Script execution doesn't put the CWD on sys.path; the `backend` namespace
# package (no __init__.py) resolves against the repo root.
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(_REPO_ROOT))

# Must be set before importing backend modules (auth/config read at import).
os.environ["MINDGUARD_DB_DIR"] = str(DB_DIR)
os.environ["JWT_SECRET"] = "e2e-jwt-secret-do-not-use-in-prod"
os.environ["ENCRYPTION_KEY"] = "e" * 64  # 64 hex chars = 32-byte AES-256 key
os.environ.setdefault("ENFORCE_CONSENT_ANALYSIS", "true")

DB_DIR.mkdir(parents=True, exist_ok=True)

from backend import database  # noqa: E402
from backend.auth import hash_password  # noqa: E402

# Ensure schema exists (fresh DB or one already created by the webServer),
# then wipe every table so each e2e run starts from a deterministic state.
database.init_db()

_TABLES = [
    "email_events", "demo_requests", "consent_events", "consent_templates",
    "students", "notification_preferences", "group_message_read",
    "group_messages", "group_members", "groups", "rolling_risk", "notes",
    "audit_log", "alerts", "linked_accounts", "consents", "institutions",
    "notifications", "communications", "referrals", "analyses", "users",
]
_conn = database.get_db()
_conn.execute("PRAGMA foreign_keys=OFF")
for _t in _TABLES:
    _conn.execute(f'DELETE FROM "{_t}"')
_conn.commit()
_conn.close()

database.seed_defaults()

# Deterministic seed accounts (upserted; keep in sync with login test creds).
ACCOUNTS = [
    ("e2e-admin", "e2e-admin@school.edu", "E2E Admin", "admin"),
    ("e2e-counsellor", "e2e-counsellor@school.edu", "E2E Counsellor", "counsellor"),
]
for _uid, email, name, role in ACCOUNTS:
    existing = database.get_user_by_email(email)
    conn = database.get_db()
    if existing:
        conn.execute("UPDATE users SET role_type = ? WHERE id = ?", (role, existing["id"]))
    else:
        database.create_user(email, name, hash_password("Password123!"), role_type=role)
    conn.commit()
    conn.close()

institutions = database.list_institutions()
inst = next((i for i in institutions if i["name"] == "E2E Test School"), None)
if not inst:
    inst = database.create_institution("E2E Test School", inst_type="k12")

print(f"SEED_OK institution_id={inst['id']}")
