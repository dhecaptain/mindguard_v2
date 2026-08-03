"""Tests for one-action roster upload + consent dispatch (Brief §2.4/§2.5)."""

from backend.services import consent_service, crypto, roster_service

CSV_HEADER = "student_id,first_name,last_name,email,date_of_birth,grade_level,parent_email\n"


def _seed_admin(db) -> None:
    u = db.create_user("admin@school.edu", "Admin", "x", role_type="admin")
    conn = db.get_db()
    conn.execute("UPDATE users SET id = 'admin-001' WHERE id = ?", (u["id"],))
    conn.commit()
    conn.close()


def _csv(body: str) -> bytes:
    return (CSV_HEADER + body).encode("utf-8")


def _students_for(db, summary) -> list:
    return [db.get_student_by_id(i) for i in summary["student_ids"]]


def _fake_send(monkeypatch, store):
    def fake_send(to, subject, body, **kwargs):
        store.append((to, subject, kwargs))
        return True, ""

    monkeypatch.setattr(consent_service, "send_html_email", fake_send)


def _current_consent(db, roster_student_id):
    """Consent linked to a roster student via students.current_consent_id."""
    row = db.get_student_by_id(roster_student_id)
    return db.get_consent_by_id(row["current_consent_id"])


def test_commit_dispatches_adult_to_student(monkeypatch, db):
    _seed_admin(db)
    inst = db.create_institution("Riverside High", "secondary")
    summary = roster_service.upsert_roster(
        inst["id"],
        _csv("U-1,Alex,Roe,alex@uni.edu,2002-05-05,12,\n"),
        "admin-001",
    )
    sent = []
    _fake_send(monkeypatch, sent)
    result = consent_service.dispatch_consents_for_students(
        _students_for(db, summary), "admin-001"
    )
    assert result["created"] == 1
    assert result["dispatched"] == 1
    assert result["email_sent"] == 1
    assert result["courtesy_sent"] == 0
    assert result["routing_errors"] == []
    assert sent[0][0] == "alex@uni.edu"

    consent = _current_consent(db, summary["student_ids"][0])
    assert consent is not None
    assert consent["recipient_role"] == "student"
    assert consent["status"] == "PENDING"


def test_commit_dispatches_minor_to_parent_with_courtesy(monkeypatch, db):
    _seed_admin(db)
    inst = db.create_institution("Riverside High", "secondary")
    summary = roster_service.upsert_roster(
        inst["id"],
        _csv("S-1,Jane,Doe,jane@school.edu,2010-01-01,9,mom@school.edu\n"),
        "admin-001",
    )
    sent = []
    _fake_send(monkeypatch, sent)
    result = consent_service.dispatch_consents_for_students(
        _students_for(db, summary), "admin-001"
    )
    assert result["created"] == 1
    assert result["courtesy_sent"] == 1
    addresses = {s[0] for s in sent}
    assert "mom@school.edu" in addresses
    assert "jane@school.edu" in addresses

    consent = _current_consent(db, summary["student_ids"][0])
    assert consent is not None
    assert consent["recipient_role"] == "parent"
    assert consent["recipient_email"] == "mom@school.edu"
    assert consent["status"] == "PENDING"


def test_commit_minor_without_parent_is_routing_error(monkeypatch, db):
    _seed_admin(db)
    inst = db.create_institution("Riverside High", "secondary")
    
    # 1. Verification at upload validation time:
    # A minor without parent email is rejected at validation (cannot proceed)
    summary = roster_service.upsert_roster(
        inst["id"],
        _csv("S-1,Jane,Doe,jane@school.edu,2010-01-01,9,\n"),
        "admin-001",
    )
    assert len(summary["errors"]) == 1
    assert "parent_email is required" in summary["errors"][0]["error"]
    assert summary["created"] == 0

    # 2. Verification at dispatch time (defensive path):
    # Construct a student row bypassing the CSV validator to test service robustness
    student_payload = dict(
        institution_id=inst["id"],
        student_id_hash=crypto.hash_student_id("S-2"),
        first_name_encrypted=crypto.encrypt_pii("Bob"),
        email_encrypted=crypto.encrypt_pii("bob@school.edu"),
        date_of_birth_encrypted=crypto.encrypt_pii("2010-01-01"),
        is_minor=True,
        created_by="admin-001",
        parent_email_encrypted=None,
    )
    created_student = db.create_student(**student_payload)
    created_student = db.get_student_by_id(created_student["id"])

    sent = []
    _fake_send(monkeypatch, sent)
    result = consent_service.dispatch_consents_for_students(
        [created_student], "admin-001"
    )
    assert result["created"] == 0
    assert result["skipped_no_parent"] == 1
    assert len(result["routing_errors"]) == 1
    assert "parent_email" in result["routing_errors"][0]["reason"]
    assert sent == []


def test_commit_skips_students_with_live_consent(monkeypatch, db):
    _seed_admin(db)
    inst = db.create_institution("Riverside High", "secondary")
    summary = roster_service.upsert_roster(
        inst["id"],
        _csv("U-1,Alex,Roe,alex@uni.edu,2002-05-05,12,\n"),
        "admin-001",
    )
    sent = []
    _fake_send(monkeypatch, sent)
    consent_service.dispatch_consents_for_students(
        _students_for(db, summary), "admin-001"
    )

    sent.clear()
    result = consent_service.dispatch_consents_for_students(
        _students_for(db, summary), "admin-001"
    )
    assert result["created"] == 0
    assert result["skipped_live"] == 1
    assert sent == []


def test_commit_defaults_platforms(monkeypatch, db):
    _seed_admin(db)
    inst = db.create_institution("Riverside High", "secondary")
    summary = roster_service.upsert_roster(
        inst["id"],
        _csv("U-1,Alex,Roe,alex@uni.edu,2002-05-05,12,\n"),
        "admin-001",
    )
    sent = []
    _fake_send(monkeypatch, sent)
    consent_service.dispatch_consents_for_students(_students_for(db, summary), "admin-001")
    import json
    consent = _current_consent(db, summary["student_ids"][0])
    assert json.loads(consent["platforms_json"]) == consent_service.DEFAULT_BULK_PLATFORMS
