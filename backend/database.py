import json
import logging
import secrets
import sqlite3
import string
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).resolve().parent.parent / "mindguard.db"


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role_type TEXT NOT NULL DEFAULT 'student',
            password_hash TEXT NOT NULL,
            avatar_url TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'pending',
            terms_accepted_at TEXT DEFAULT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            platform TEXT NOT NULL DEFAULT 'text',
            text TEXT,
            prob REAL NOT NULL,
            label TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS referrals (
            id TEXT PRIMARY KEY,
            counsellor_id TEXT NOT NULL REFERENCES users(id),
            student_id TEXT NOT NULL REFERENCES users(id),
            urgency TEXT NOT NULL DEFAULT 'medium',
            status TEXT NOT NULL DEFAULT 'open',
            notes TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS communications (
            id TEXT PRIMARY KEY,
            sender_id TEXT NOT NULL REFERENCES users(id),
            receiver_id TEXT NOT NULL REFERENCES users(id),
            message TEXT NOT NULL,
            read INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'general',
            read INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS institutions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'university',
            created_at TEXT NOT NULL,
            retention_days INTEGER DEFAULT 30,
            alert_threshold REAL DEFAULT 0.65,
            confidence_floor REAL DEFAULT 0.70
        );

        CREATE TABLE IF NOT EXISTS consents (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES users(id),
            counsellor_id TEXT NOT NULL REFERENCES users(id),
            recipient_email TEXT NOT NULL,
            recipient_role TEXT NOT NULL DEFAULT 'student',
            status TEXT NOT NULL DEFAULT 'DRAFT',
            platforms_json TEXT DEFAULT '[]',
            mode TEXT DEFAULT 'ON_DEMAND',
            document_version TEXT DEFAULT 'v2.0',
            magic_token TEXT,
            magic_token_expires_at TEXT,
            signature_name TEXT,
            signature_ip TEXT,
            dispatched_at TEXT,
            viewed_at TEXT,
            accepted_at TEXT,
            declined_at TEXT,
            revoked_at TEXT,
            expires_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS linked_accounts (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES users(id),
            consent_id TEXT REFERENCES consents(id),
            platform TEXT NOT NULL,
            mode TEXT DEFAULT 'handle',
            handle TEXT,
            status TEXT DEFAULT 'active',
            last_synced_at TEXT,
            last_error TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES users(id),
            counsellor_id TEXT NOT NULL REFERENCES users(id),
            fired_at TEXT NOT NULL,
            risk_score REAL NOT NULL,
            threshold_at_fire REAL NOT NULL,
            platform TEXT,
            status TEXT NOT NULL DEFAULT 'OPEN',
            disposition TEXT,
            disposition_reason TEXT,
            disposition_note TEXT,
            dispositioned_by TEXT,
            dispositioned_at TEXT,
            supersedes_id TEXT,
            cooldown_until TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_log (
            id TEXT PRIMARY KEY,
            actor_id TEXT,
            actor_role TEXT,
            action TEXT NOT NULL,
            target_type TEXT,
            target_id TEXT,
            payload_json TEXT,
            ip TEXT,
            occurred_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES users(id),
            author_id TEXT NOT NULL REFERENCES users(id),
            body TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS rolling_risk (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES users(id),
            computed_at TEXT NOT NULL,
            score REAL NOT NULL,
            window_days INTEGER DEFAULT 14,
            top_platform TEXT,
            n_posts INTEGER DEFAULT 0
        );
    """)
    # Migrations for existing DBs
    for migration in [
        "ALTER TABLE users ADD COLUMN terms_accepted_at TEXT DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN dob TEXT DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN parent_email TEXT DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN referral_code TEXT DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN referred_by TEXT DEFAULT NULL",
    ]:
        try:
            conn.execute(migration)
            conn.commit()
        except Exception:
            pass
    conn.close()


def _make_referral_code() -> str:
    alphabet = string.ascii_uppercase.replace('O', '').replace('I', '') + '23456789'
    return ''.join(secrets.choice(alphabet) for _ in range(8))


def seed_defaults():
    """Seed demo users if the DB is fresh."""
    conn = get_db()
    cur = conn.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] > 0:
        conn.close()
        return

    import bcrypt
    pw = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode()

    now = datetime.now(timezone.utc).isoformat()
    users = [
        ("admin-001",  "admin@mindguard.org",      "Admin User",      "admin",      pw, "approved", now),
        ("couns-001",  "counsellor@mindguard.org",  "Sarah Counsellor","counsellor", pw, "approved", now),
        ("stud-001",   "student@mindguard.org",     "Demo Student",    "student",    pw, "approved", now),
        ("stud-002",   "diana@mindguard.org",       "Diana Opiyo",     "student",    pw, "approved", "2025-01-15T00:00:00"),
        ("stud-003",   "brian@student.ac.ke",       "Brian Mwangi",    "student",    pw, "pending",  "2025-02-03T00:00:00"),
        ("stud-004",   "fatuma@student.ac.ke",      "Fatuma Hassan",   "student",    pw, "approved", "2025-02-10T00:00:00"),
        ("stud-005",   "kevin@student.ac.ke",       "Kevin Otieno",    "student",    pw, "pending",  "2025-03-01T00:00:00"),
        ("couns-002",  "demo@mindguard.org",        "Demo User",       "counsellor", pw, "approved", now),
    ]
    conn.executemany(
        "INSERT INTO users (id, email, name, role_type, password_hash, status, created_at) VALUES (?,?,?,?,?,?,?)",
        users,
    )
    conn.commit()
    conn.close()


def get_user_by_email(email: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_user(
    email: str, name: str, password_hash: str, role_type: str = "student",
    dob: str | None = None, parent_email: str | None = None, referred_by: str | None = None,
) -> dict:
    uid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    # Generate a unique referral code
    for _ in range(10):
        code = _make_referral_code()
        exists = conn.execute("SELECT 1 FROM users WHERE referral_code = ?", (code,)).fetchone()
        if not exists:
            break
    conn.execute(
        "INSERT INTO users (id, email, name, role_type, password_hash, status, created_at, dob, parent_email, referral_code, referred_by) "
        "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (uid, email.strip().lower(), name, role_type, password_hash, "pending", now, dob, parent_email, code, referred_by),
    )
    conn.commit()
    conn.close()
    return {"id": uid, "email": email, "name": name, "role_type": role_type, "status": "pending", "referral_code": code}


def get_user_by_referral_code(code: str) -> dict | None:
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE referral_code = ?", (code.upper(),)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_users() -> list[dict]:
    conn = get_db()
    rows = conn.execute("SELECT id, email, name, role_type, status FROM users ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def accept_user_terms(user_id: str) -> bool:
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cur = conn.execute(
        "UPDATE users SET terms_accepted_at = ? WHERE id = ? AND terms_accepted_at IS NULL",
        (now, user_id),
    )
    conn.commit()
    ok = cur.rowcount > 0
    conn.close()
    return ok


def get_students(limit: int = 200, offset: int = 0):
    conn = get_db()
    rows = conn.execute(
        "SELECT id, email, name, role_type, status, created_at FROM users "
        "WHERE role_type = 'student' ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (limit, offset),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_student_status(student_id: str, status: str) -> bool:
    conn = get_db()
    cur = conn.execute("UPDATE users SET status = ? WHERE id = ? AND role_type = 'student'", (status, student_id))
    conn.commit()
    ok = cur.rowcount > 0
    conn.close()
    return ok


def save_analysis(user_id: str, platform: str, text: str | None, prob: float, label: str):
    aid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO analyses (id, user_id, platform, text, prob, label, created_at) VALUES (?,?,?,?,?,?,?)",
        (aid, user_id, platform, text, prob, label, now),
    )
    conn.commit()
    conn.close()
    return aid


def get_analyses(user_id: str, limit: int = 20):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        (user_id, limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_analytics(user_id: str):
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM analyses WHERE user_id = ?", (user_id,)).fetchone()[0]
    neg = conn.execute("SELECT COUNT(*) FROM analyses WHERE user_id = ? AND label = 'Suicidal'", (user_id,)).fetchone()[0]
    pos = conn.execute("SELECT COUNT(*) FROM analyses WHERE user_id = ? AND label = 'Non-Suicidal'", (user_id,)).fetchone()[0]
    recent = conn.execute(
        "SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
        (user_id,),
    ).fetchall()
    conn.close()
    return {
        "total_analyses": total,
        "positive_count": pos,
        "negative_count": neg,
        "history": [dict(r) for r in recent],
    }


def create_referral(counsellor_id: str, student_id: str, urgency: str, notes: str = "") -> dict:
    """Create a referral and student notification atomically. Returns full row including student_name."""
    rid = str(uuid.uuid4())
    nid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    try:
        conn.execute("BEGIN")
        conn.execute(
            "INSERT INTO referrals (id, counsellor_id, student_id, urgency, notes, status, created_at, updated_at) "
            "VALUES (?,?,?,?,?,'open',?,?)",
            (rid, counsellor_id, student_id, urgency, notes, now, now),
        )
        conn.execute(
            "INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES (?,?,?,?,?,0,?)",
            (nid, student_id, "New Referral", f"A referral has been created for you with {urgency} urgency.", "referral", now),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        conn.close()
        raise
    row = conn.execute(
        "SELECT r.*, u.name as student_name, u.email as student_email "
        "FROM referrals r JOIN users u ON r.student_id = u.id WHERE r.id = ?",
        (rid,),
    ).fetchone()
    conn.close()
    return dict(row) if row else {"id": rid, "counsellor_id": counsellor_id, "student_id": student_id, "urgency": urgency, "notes": notes, "status": "open", "created_at": now, "updated_at": now}


def get_referrals(counsellor_id: str | None = None):
    conn = get_db()
    if counsellor_id:
        rows = conn.execute(
            "SELECT r.*, u.name as student_name, u.email as student_email "
            "FROM referrals r JOIN users u ON r.student_id = u.id "
            "WHERE r.counsellor_id = ? ORDER BY r.created_at DESC",
            (counsellor_id,),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT r.*, u.name as student_name, u.email as student_email "
            "FROM referrals r JOIN users u ON r.student_id = u.id ORDER BY r.created_at DESC",
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_referral(referral_id: str, status: str | None = None, notes: str | None = None) -> dict | None:
    conn = get_db()
    now = datetime.now(timezone.utc).isoformat()
    updates = []
    params = []
    if status:
        updates.append("status = ?")
        params.append(status)
    if notes is not None:
        updates.append("notes = ?")
        params.append(notes)
    if not updates:
        # Nothing to update — return current state
        row = conn.execute(
            "SELECT r.*, u.name as student_name, u.email as student_email "
            "FROM referrals r JOIN users u ON r.student_id = u.id WHERE r.id = ?",
            (referral_id,),
        ).fetchone()
        conn.close()
        return dict(row) if row else None
    updates.append("updated_at = ?")
    params.append(now)
    params.append(referral_id)
    try:
        conn.execute("BEGIN")
        conn.execute(f"UPDATE referrals SET {', '.join(updates)} WHERE id = ?", params)
        row = conn.execute(
            "SELECT r.*, u.name as student_name, u.email as student_email "
            "FROM referrals r JOIN users u ON r.student_id = u.id WHERE r.id = ?",
            (referral_id,),
        ).fetchone()
        conn.commit()
    except Exception:
        conn.rollback()
        conn.close()
        raise
    conn.close()
    return dict(row) if row else None


def send_message(sender_id: str, receiver_id: str, message: str) -> dict:
    mid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO communications (id, sender_id, receiver_id, message, read, created_at) VALUES (?,?,?,?,0,?)",
        (mid, sender_id, receiver_id, message, now),
    )
    conn.commit()
    conn.close()
    return {"id": mid, "sender_id": sender_id, "receiver_id": receiver_id, "message": message, "read": False, "created_at": now}


def get_conversation(user_id: str, other_id: str, limit: int = 50):
    conn = get_db()
    rows = conn.execute(
        """SELECT * FROM communications
           WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
           ORDER BY created_at ASC LIMIT ?""",
        (user_id, other_id, other_id, user_id, limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_conversations(user_id: str):
    """Get all unique conversation partners with last message."""
    conn = get_db()
    partners = conn.execute(
        """SELECT DISTINCT other_id FROM (
               SELECT receiver_id AS other_id FROM communications WHERE sender_id = ?
               UNION
               SELECT sender_id AS other_id FROM communications WHERE receiver_id = ?
           )""",
        (user_id, user_id),
    ).fetchall()
    result = []
    for row in partners:
        other_id = row["other_id"]
        last = conn.execute(
            "SELECT message, created_at FROM communications "
            "WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) "
            "ORDER BY created_at DESC LIMIT 1",
            (user_id, other_id, other_id, user_id),
        ).fetchone()
        other = conn.execute("SELECT name, email FROM users WHERE id = ?", (other_id,)).fetchone()
        unread = conn.execute(
            "SELECT COUNT(*) FROM communications WHERE sender_id = ? AND receiver_id = ? AND read = 0",
            (other_id, user_id),
        ).fetchone()[0]
        result.append({
            "other_id": other_id,
            "other_name": other["name"] if other else "Unknown",
            "other_email": other["email"] if other else "",
            "last_message": last["message"] if last else "",
            "last_time": last["created_at"] if last else "",
            "unread": unread,
        })
    result.sort(key=lambda x: x["last_time"], reverse=True)
    conn.close()
    return result


def mark_read(message_id: str):
    conn = get_db()
    conn.execute("UPDATE communications SET read = 1 WHERE id = ?", (message_id,))
    conn.commit()
    conn.close()


def mark_all_read(user_id: str, other_id: str):
    conn = get_db()
    conn.execute(
        "UPDATE communications SET read = 1 WHERE sender_id = ? AND receiver_id = ?",
        (other_id, user_id),
    )
    conn.commit()
    conn.close()


def create_notification(user_id: str, title: str, message: str, ntype: str = "general"):
    nid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES (?,?,?,?,?,0,?)",
        (nid, user_id, title, message, ntype, now),
    )
    conn.commit()
    conn.close()
    return nid


def get_notifications(user_id: str, limit: int = 50):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        (user_id, limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_notification_summary(user_id: str):
    conn = get_db()
    unread = conn.execute(
        "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read = 0",
        (user_id,),
    ).fetchone()[0]
    conn.close()
    return {"unread": unread}


def mark_notification_read(nid: str):
    conn = get_db()
    conn.execute("UPDATE notifications SET read = 1 WHERE id = ?", (nid,))
    conn.commit()
    conn.close()


def get_counsellor_dashboard(counsellor_id: str):
    conn = get_db()
    total_students = conn.execute("SELECT COUNT(*) FROM users WHERE role_type = 'student'").fetchone()[0]
    pending = conn.execute("SELECT COUNT(*) FROM users WHERE role_type = 'student' AND status = 'pending'").fetchone()[0]
    open_referrals = conn.execute("SELECT COUNT(*) FROM referrals WHERE counsellor_id = ? AND status = 'open'", (counsellor_id,)).fetchone()[0]
    crisis_flags = conn.execute(
        "SELECT COUNT(*) FROM analyses WHERE prob >= 0.75 AND created_at >= datetime('now', '-7 days')"
    ).fetchone()[0]
    recent_referrals = conn.execute(
        "SELECT r.*, u.name as student_name FROM referrals r JOIN users u ON r.student_id = u.id "
        "WHERE r.counsellor_id = ? ORDER BY r.created_at DESC LIMIT 5",
        (counsellor_id,),
    ).fetchall()
    conn.close()
    return {
        "total_students": total_students,
        "pending_approvals": pending,
        "open_referrals": open_referrals,
        "crisis_flags_7d": crisis_flags,
        "recent_referrals": [dict(r) for r in recent_referrals],
    }


# ── Institution functions ─────────────────────────────────────────────

def create_institution(name: str, inst_type: str = "university") -> dict:
    iid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO institutions (id, name, type, created_at) VALUES (?,?,?,?)",
        (iid, name, inst_type, now),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM institutions WHERE id = ?", (iid,)).fetchone()
    conn.close()
    return dict(row)


def get_institution_by_id(inst_id: str) -> dict | None:
    conn = get_db()
    row = conn.execute("SELECT * FROM institutions WHERE id = ?", (inst_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── Consent functions ─────────────────────────────────────────────────

def create_consent(
    student_id: str,
    counsellor_id: str,
    recipient_email: str,
    recipient_role: str,
    platforms: list,
    mode: str = "ON_DEMAND",
) -> dict:
    cid = str(uuid.uuid4())
    magic_token = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    magic_token_expires_at = (now + timedelta(hours=72)).isoformat()
    expires_at = (now + timedelta(days=7)).isoformat()
    now_iso = now.isoformat()
    conn = get_db()
    conn.execute(
        """INSERT INTO consents (
            id, student_id, counsellor_id, recipient_email, recipient_role,
            status, platforms_json, mode, magic_token, magic_token_expires_at,
            expires_at, created_at, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            cid, student_id, counsellor_id, recipient_email, recipient_role,
            "DRAFT", json.dumps(platforms), mode, magic_token,
            magic_token_expires_at, expires_at, now_iso, now_iso,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM consents WHERE id = ?", (cid,)).fetchone()
    conn.close()
    return dict(row)


def get_consent_by_id(consent_id: str) -> dict | None:
    conn = get_db()
    row = conn.execute("SELECT * FROM consents WHERE id = ?", (consent_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_consent_by_token(token: str) -> dict | None:
    conn = get_db()
    row = conn.execute("SELECT * FROM consents WHERE magic_token = ?", (token,)).fetchone()
    conn.close()
    return dict(row) if row else None


def update_consent_status(consent_id: str, status: str, **kwargs) -> dict | None:
    """Update consent status and any additional keyword fields. Sets updated_at automatically."""
    now = datetime.now(timezone.utc).isoformat()
    allowed_fields = {
        "magic_token", "magic_token_expires_at", "signature_name", "signature_ip",
        "dispatched_at", "viewed_at", "accepted_at", "declined_at", "revoked_at",
        "expires_at", "platforms_json",
    }
    updates = ["status = ?", "updated_at = ?"]
    params = [status, now]
    for field, value in kwargs.items():
        if field in allowed_fields:
            updates.append(f"{field} = ?")
            params.append(value)
    params.append(consent_id)
    conn = get_db()
    conn.execute(f"UPDATE consents SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    row = conn.execute("SELECT * FROM consents WHERE id = ?", (consent_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_consents_by_counsellor(counsellor_id: str) -> list:
    conn = get_db()
    rows = conn.execute(
        "SELECT c.*, u.name as student_name, u.email as student_email "
        "FROM consents c JOIN users u ON c.student_id = u.id "
        "WHERE c.counsellor_id = ? ORDER BY c.created_at DESC",
        (counsellor_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_consents_by_student(student_id: str) -> list:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM consents WHERE student_id = ? ORDER BY created_at DESC",
        (student_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Linked account functions ──────────────────────────────────────────

def create_linked_account(
    student_id: str,
    consent_id: str | None,
    platform: str,
    mode: str,
    handle: str | None,
) -> dict:
    aid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO linked_accounts (id, student_id, consent_id, platform, mode, handle, status, created_at) "
        "VALUES (?,?,?,?,?,?,?,?)",
        (aid, student_id, consent_id, platform, mode, handle, "active", now),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM linked_accounts WHERE id = ?", (aid,)).fetchone()
    conn.close()
    return dict(row)


def get_linked_accounts(student_id: str) -> list:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM linked_accounts WHERE student_id = ? ORDER BY created_at DESC",
        (student_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def revoke_linked_account(account_id: str) -> bool:
    conn = get_db()
    cur = conn.execute(
        "UPDATE linked_accounts SET status = 'revoked' WHERE id = ?",
        (account_id,),
    )
    conn.commit()
    ok = cur.rowcount > 0
    conn.close()
    return ok


# ── Alert functions ───────────────────────────────────────────────────

def create_alert(
    student_id: str,
    counsellor_id: str,
    risk_score: float,
    threshold_at_fire: float,
    platform: str | None,
) -> dict | None:
    """Create alert unless student has an open alert with cooldown_until in the future."""
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    # Check existing open alert with active cooldown
    existing = conn.execute(
        "SELECT * FROM alerts WHERE student_id = ? AND status = 'OPEN' ORDER BY created_at DESC LIMIT 1",
        (student_id,),
    ).fetchone()
    if existing:
        existing = dict(existing)
        cooldown = existing.get("cooldown_until", "")
        if cooldown and now < cooldown:
            conn.close()
            return None

    alert_id = str(uuid.uuid4())
    conn.execute(
        """INSERT INTO alerts (
            id, student_id, counsellor_id, fired_at, risk_score, threshold_at_fire,
            platform, status, created_at
        ) VALUES (?,?,?,?,?,?,?,?,?)""",
        (alert_id, student_id, counsellor_id, now, risk_score, threshold_at_fire,
         platform, "OPEN", now),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_alerts(counsellor_id: str, status: str | None = None) -> list:
    conn = get_db()
    if status:
        rows = conn.execute(
            "SELECT a.*, u.name as student_name, u.email as student_email "
            "FROM alerts a JOIN users u ON a.student_id = u.id "
            "WHERE a.counsellor_id = ? AND a.status = ? ORDER BY a.fired_at DESC",
            (counsellor_id, status),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT a.*, u.name as student_name, u.email as student_email "
            "FROM alerts a JOIN users u ON a.student_id = u.id "
            "WHERE a.counsellor_id = ? ORDER BY a.fired_at DESC",
            (counsellor_id,),
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_open_alert_for_student(student_id: str) -> dict | None:
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM alerts WHERE student_id = ? AND status = 'OPEN' ORDER BY created_at DESC LIMIT 1",
        (student_id,),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def dispose_alert(
    alert_id: str,
    disposition: str,
    reason_code: str,
    reason_note: str,
    dispositioned_by: str,
    supersedes_id: str | None = None,
) -> dict | None:
    now = datetime.now(timezone.utc)
    cooldown_until = (now + timedelta(hours=12)).isoformat()
    now_iso = now.isoformat()
    conn = get_db()
    conn.execute(
        """UPDATE alerts SET
            status = 'CLOSED',
            disposition = ?,
            disposition_reason = ?,
            disposition_note = ?,
            dispositioned_by = ?,
            dispositioned_at = ?,
            supersedes_id = ?,
            cooldown_until = ?
        WHERE id = ?""",
        (disposition, reason_code, reason_note, dispositioned_by,
         now_iso, supersedes_id, cooldown_until, alert_id),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── Audit log functions ───────────────────────────────────────────────

def write_audit(
    actor_id: str | None,
    actor_role: str | None,
    action: str,
    target_type: str | None,
    target_id: str | None,
    payload: dict | None = None,
    ip: str | None = None,
) -> str:
    aid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO audit_log (id, actor_id, actor_role, action, target_type, target_id, payload_json, ip, occurred_at) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (aid, actor_id, actor_role, action, target_type, target_id,
         json.dumps(payload) if payload else None, ip, now),
    )
    conn.commit()
    conn.close()
    return aid


def get_audit_log(counsellor_id: str, limit: int = 100) -> list:
    """Return audit entries where actor is the counsellor or target is one of their students."""
    conn = get_db()
    student_ids = [
        r["id"] for r in conn.execute(
            "SELECT id FROM users WHERE role_type = 'student'",
        ).fetchall()
    ]
    # Build a query that returns entries where actor is the counsellor or target_id is a student
    placeholders = ",".join("?" * len(student_ids)) if student_ids else "''"
    query = f"""
        SELECT * FROM audit_log
        WHERE actor_id = ?
           OR target_id IN ({placeholders})
        ORDER BY occurred_at DESC LIMIT ?
    """
    params = [counsellor_id] + student_ids + [limit]
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Notes functions ───────────────────────────────────────────────────

def create_note(student_id: str, author_id: str, body: str) -> dict:
    nid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO notes (id, student_id, author_id, body, created_at, updated_at) VALUES (?,?,?,?,?,?)",
        (nid, student_id, author_id, body, now, now),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM notes WHERE id = ?", (nid,)).fetchone()
    conn.close()
    return dict(row)


def get_notes(student_id: str) -> list:
    conn = get_db()
    rows = conn.execute(
        "SELECT n.*, u.name as author_name FROM notes n JOIN users u ON n.author_id = u.id "
        "WHERE n.student_id = ? ORDER BY n.created_at DESC",
        (student_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Rolling risk functions ────────────────────────────────────────────

def update_rolling_risk(
    student_id: str,
    score: float,
    top_platform: str | None,
    n_posts: int,
    window_days: int = 14,
) -> dict:
    rid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO rolling_risk (id, student_id, computed_at, score, window_days, top_platform, n_posts) "
        "VALUES (?,?,?,?,?,?,?)",
        (rid, student_id, now, score, window_days, top_platform, n_posts),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM rolling_risk WHERE id = ?", (rid,)).fetchone()
    conn.close()
    return dict(row)


def get_rolling_risk(student_id: str) -> dict | None:
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM rolling_risk WHERE student_id = ? ORDER BY computed_at DESC LIMIT 1",
        (student_id,),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_rolling_risk_history(student_id: str, limit: int = 90) -> list:
    """Return chronological rolling risk history for timeline display."""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM rolling_risk WHERE student_id = ? ORDER BY computed_at ASC LIMIT ?",
        (student_id, limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
