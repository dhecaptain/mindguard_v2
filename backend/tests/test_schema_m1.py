"""Schema + data-model tests for the M1 consent & roster layer (Brief §3)."""

import bcrypt

from services import crypto

NEW_TABLES = [
    "students",
    "consent_templates",
    "consent_events",
    "demo_requests",
    "email_events",
]


def _columns(conn, table):
    return [r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()]


def _seed_user(db, uid, email, name, role):
    conn = db.get_db()
    conn.execute(
        "INSERT INTO users (id,email,name,role_type,password_hash,status,created_at) "
        "VALUES (?,?,?,?,?, 'approved', ?)",
        (uid, email, name, role, bcrypt.hashpw(b"p", bcrypt.gensalt()).decode(), "2025-01-01T00:00:00"),
    )
    conn.commit()
    conn.close()


def _seed_fk_parents(db, institution):
    _seed_user(db, "admin-001", "a@t.org", "A", "admin")
    _seed_user(db, "stud-user", "s@t.org", "S", "student")


def _seed_stud_user(db):
    _seed_user(db, "stud-user", "s@t.org", "S", "student")


def test_init_db_is_idempotent(db):
    db.init_db()
    db.init_db()
    conn = db.get_db()
    names = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    conn.close()
    for t in NEW_TABLES:
        assert t in names


def test_new_tables_have_uuid_text_pks_and_created_at(db):
    conn = db.get_db()
    for t in NEW_TABLES:
        cols = _columns(conn, t)
        assert "id" in cols
        assert "created_at" in cols
    conn.close()


def test_extended_columns_additive(db):
    conn = db.get_db()
    assert {
        "minor_age_threshold", "consent_template_id",
        "consent_reminder_days", "consent_expiry_days",
    } <= set(_columns(conn, "institutions"))
    assert {
        "signed_token_hash", "response_ip", "response_user_agent",
        "reminders_sent", "template_version", "notes",
    } <= set(_columns(conn, "consents"))
    assert "permissions_json" in _columns(conn, "users")
    conn.close()


def test_student_crud_with_encryption(db):
    inst = db.create_institution("Test High", "k12")
    _seed_fk_parents(db, inst)
    sid = db.create_student(
        inst["id"],
        crypto.hash_student_id("S-1"),
        crypto.encrypt_pii("Jane"),
        crypto.encrypt_pii("jane@school.edu"),
        crypto.encrypt_pii("2010-01-01"),
        True,
        "admin-001",
        crypto.encrypt_pii("mom@school.edu"),
        crypto.encrypt_pii("Mom"),
    )["id"]
    assert db.get_student_by_id(sid) is not None
    assert db.get_student_by_student_id_hash(crypto.hash_student_id("s-1")) is not None
    db.update_student(sid, is_minor=0)
    assert db.get_student_by_id(sid)["is_minor"] == 0
    # raw PII never stored
    stored = db.get_student_by_id(sid)
    assert stored["first_name_encrypted"].startswith("gcm1:")
    assert "Jane" not in stored["first_name_encrypted"]
    assert stored["student_id_hash"] == crypto.hash_student_id("S-1")


def test_student_current_consent_fk(db):
    inst = db.create_institution("Test High", "k12")
    _seed_fk_parents(db, inst)
    sid = db.create_student(
        inst["id"], crypto.hash_student_id("S-1"),
        crypto.encrypt_pii("Jane"), crypto.encrypt_pii("jane@school.edu"),
        crypto.encrypt_pii("2010-01-01"), True, "admin-001",
    )["id"]
    cons = db.create_consent("stud-user", "admin-001", "mom@school.edu", "parent", ["reddit"])
    db.set_student_current_consent(sid, cons["id"])
    assert db.get_student_by_id(sid)["current_consent_id"] == cons["id"]
    db.set_student_current_consent(sid, None)
    assert db.get_student_by_id(sid)["current_consent_id"] is None


def test_student_soft_delete(db):
    inst = db.create_institution("Test High", "k12")
    _seed_fk_parents(db, inst)
    sid = db.create_student(
        inst["id"], crypto.hash_student_id("S-2"),
        crypto.encrypt_pii("Bob"), crypto.encrypt_pii("b@school.edu"),
        crypto.encrypt_pii("2000-05-05"), False, "admin-001",
    )["id"]
    assert db.soft_delete_student(sid) is True
    assert db.get_student_by_id(sid) is None


def test_consent_template_crud_and_active(db):
    inst = db.create_institution("Test High", "k12")
    tid = db.create_consent_template("1.0.0", "en", institution_id=inst["id"])["id"]
    assert db.get_consent_template(tid)["version"] == "1.0.0"
    assert db.get_active_consent_template(inst["id"])["id"] == tid
    assert len(db.list_consent_templates(inst["id"])) == 1


def test_consent_events_append_only(db):
    _seed_user(db, "admin-001", "a@t.org", "A", "admin")
    _seed_stud_user(db)
    cons = db.create_consent("stud-user", "admin-001", "s@t.org", "student", ["reddit"])
    db.create_consent_event(cons["id"], "created", "system")
    db.create_consent_event(cons["id"], "accepted", "recipient", None, {"ip": "1.2.3.4"})
    events = db.get_consent_events(cons["id"])
    assert [e["event_type"] for e in events] == ["created", "accepted"]


def test_demo_request_crud_and_status_transitions(db):
    dr = db.create_demo_request("Diana", "diana@mindguard.org", "GVSU", "university", country="US")
    assert dr["status"] == "new"
    db.update_demo_request(dr["id"], status="contacted", notes="follow up")
    row = db.get_demo_request(dr["id"])
    assert row["status"] == "contacted"
    assert row["notes"] == "follow up"
    assert len(db.list_demo_requests(status="contacted")) == 1


def test_email_event_crud(db):
    _seed_user(db, "admin-001", "a@t.org", "A", "admin")
    _seed_stud_user(db)
    cons = db.create_consent("stud-user", "admin-001", "s@t.org", "student", ["reddit"])
    db.create_email_event("consent_request", cons["id"], "delivered", "res-123", "s@t.org")
    rows = db.get_email_events("consent_request", cons["id"])
    assert rows[0]["esp_message_id"] == "res-123"
