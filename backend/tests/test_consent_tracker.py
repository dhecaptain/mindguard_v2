"""Tests for consent tracker search, pagination and CSV export (Brief §2.7/§6)."""

from backend.database import query_consents
from backend.services.consent_service import consents_to_csv


def _seed(db) -> dict:
    counsellor = db.create_user("counsellor@school.edu", "Counsellor", "x", role_type="counsellor")
    alex = db.create_user("alex@uni.edu", "Alex Roe", "x", role_type="student")
    jane = db.create_user("jane@school.edu", "Jane Doe", "x", role_type="student")
    c1 = db.create_consent(alex["id"], counsellor["id"], "alex@uni.edu", "student", ["Reddit", "Bluesky"])
    c2 = db.create_consent(jane["id"], counsellor["id"], "mom@school.edu", "parent", ["Mastodon", "YouTube"])
    from backend.services.consent_service import dispatch_consent
    dispatch_consent(c1["id"], counsellor["id"])
    return {"counsellor": counsellor, "alex": alex, "jane": jane, "c1": c1, "c2": c2}


def test_query_consents_search_by_student_name(db):
    s = _seed(db)
    rows, total = query_consents(s["counsellor"]["id"], search="Alex")
    assert total == 1
    assert rows[0]["student_name"] == "Alex Roe"


def test_query_consents_search_by_email(db):
    s = _seed(db)
    rows, total = query_consents(s["counsellor"]["id"], search="jane@school.edu")
    assert total == 1
    assert rows[0]["student_name"] == "Jane Doe"


def test_query_consents_search_by_recipient_email(db):
    s = _seed(db)
    rows, total = query_consents(s["counsellor"]["id"], search="mom@school.edu")
    assert total == 1
    assert rows[0]["recipient_role"] == "parent"


def test_query_consents_status_filter(db):
    s = _seed(db)
    c2 = s["c2"]  # still DRAFT
    rows, total = query_consents(s["counsellor"]["id"], status="PENDING")
    assert total == 1
    assert rows[0]["id"] == s["c1"]["id"]
    rows, total = query_consents(s["counsellor"]["id"], status="DRAFT")
    assert total == 1
    assert rows[0]["id"] == c2["id"]


def test_query_consents_status_and_search_combined(db):
    s = _seed(db)
    rows, total = query_consents(s["counsellor"]["id"], status="PENDING", search="alex")
    assert total == 1
    rows, total = query_consents(s["counsellor"]["id"], status="PENDING", search="jane")
    assert total == 0


def test_query_consents_pagination(db):
    s = _seed(db)
    counsellor = s["counsellor"]["id"]
    for i in range(3):
        u = db.create_user(f"stud{i}@x.edu", f"Stud {i}", "x", role_type="student")
        db.create_consent(u["id"], counsellor, f"stud{i}@x.edu", "student", ["Reddit"])
    rows, total = query_consents(counsellor, limit=2, offset=0)
    assert len(rows) == 2
    assert total == 5
    rows2, _ = query_consents(counsellor, limit=2, offset=2)
    assert len(rows2) == 2
    assert {r["id"] for r in rows}.isdisjoint({r["id"] for r in rows2})


def test_consents_to_csv_header_and_rows(db):
    s = _seed(db)
    rows, _ = query_consents(s["counsellor"]["id"])
    csv = consents_to_csv(rows)
    lines = csv.strip().split("\r\n")
    expected_header = ",".join(
        f'"{col}"' for col in [
            "consent_id", "student_id", "student_name", "student_email",
            "recipient_email", "recipient_role", "status", "mode", "platforms",
            "dispatched_at", "viewed_at", "accepted_at", "declined_at",
            "revoked_at", "expires_at", "created_at",
        ]
    )
    assert lines[0] == expected_header
    assert len(lines) == 1 + len(rows)


def test_consents_to_csv_escapes_commas_and_quotes(db):
    counsellor = db.create_user("c@x.edu", "C", "x", role_type="counsellor")
    student = db.create_user("s@x.edu", 'S "Quoted" Last, Jr', "x", role_type="student")
    db.create_consent(student["id"], counsellor["id"], "s@x.edu", "student", ["Reddit, Inc"])
    rows, _ = query_consents(counsellor["id"])
    csv = consents_to_csv(rows)
    assert '"S ""Quoted"" Last, Jr"' in csv
    assert '"Reddit, Inc"' in csv
