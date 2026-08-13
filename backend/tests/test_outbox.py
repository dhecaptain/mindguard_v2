"""Tests for the durable email outbox + background worker (Remediation P1-1).

The outbox is a write-ahead log: ``send_html_email`` persists the message before
the transport attempt, and bulk roster dispatch enqueues without sending so the
background worker drains the rows with retry/backoff.
"""

from datetime import datetime, timedelta, timezone
import json

import pytest

from services import email_sender
from backend.services import consent_service


@pytest.fixture(autouse=True)
def clear_env(monkeypatch):
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    monkeypatch.delenv("SMTP_USER", raising=False)
    monkeypatch.delenv("SMTP_PASSWORD", raising=False)
    monkeypatch.setenv("EMAIL_FROM", "MindGuard <noreply@example.com>")


def test_send_html_email_persists_outbox_row(db):
    ok, err = email_sender.send_html_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="consent", related_id="c-1",
    )
    assert ok is False  # no transport configured
    rows = db.list_email_outbox()
    assert len(rows) == 1
    row = rows[0]
    assert row["status"] == "failed"
    assert row["to_email"] == "a@b.c"
    assert row["related_type"] == "consent"
    assert row["related_id"] == "c-1"
    assert "SMTP is not configured" in row["error"]
    assert row["attempts"] == 1
    events = db.get_email_events(related_type="consent", related_id="c-1")
    assert events[0]["event"] == "failed"


def test_send_html_email_marks_sent_on_success(db, monkeypatch):
    monkeypatch.setattr(email_sender, "_deliver", lambda *a, **k: (True, "", "resend-99"))
    ok, err = email_sender.send_html_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="consent", related_id="c-1",
    )
    assert ok is True and err == ""
    row = db.list_email_outbox()[0]
    assert row["status"] == "sent"
    assert row["esp_message_id"] == "resend-99"
    assert row["sent_at"] is not None
    assert db.count_pending_email_outbox() == 0


def test_worker_drains_enqueued_rows(db, monkeypatch):
    db.enqueue_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="consent", related_id="c-1", metadata={"kind": "consent_request"},
    )
    assert db.count_pending_email_outbox() == 1

    monkeypatch.setattr(email_sender, "_deliver", lambda *a, **k: (True, "", "resend-99"))
    result = email_sender.process_email_outbox()
    assert result == {"processed": 1, "sent": 1, "failed": 0}

    rows = db.list_email_outbox()
    assert rows[0]["status"] == "sent"
    assert rows[0]["esp_message_id"] == "resend-99"
    assert db.count_pending_email_outbox() == 0

    events = db.get_email_events(related_type="consent", related_id="c-1")
    assert events[0]["event"] == "sent"
    assert events[0]["esp_message_id"] == "resend-99"
    assert json.loads(events[0]["metadata_json"])["via"] == "outbox-worker"


def test_worker_retries_failed_rows_with_backoff(db, monkeypatch):
    oid = db.enqueue_email(
        "a@b.c", "Subject", "<p>Hi</p>",
        related_type="consent", related_id="c-1",
    )

    attempts = {"n": 0}

    def flaky(to, subject, body):
        attempts["n"] += 1
        if attempts["n"] == 1:
            return False, "resend down", ""
        return True, "", "resend-42"

    monkeypatch.setattr(email_sender, "_deliver", flaky)

    first = email_sender.process_email_outbox()
    assert first["failed"] == 1
    row = db.list_email_outbox()[0]
    assert row["status"] == "failed"
    assert row["attempts"] == 1
    assert row["next_attempt_at"]

    # Not due yet -> the next pass processes nothing.
    assert email_sender.process_email_outbox()["processed"] == 0

    # Force the retry window open, then the second attempt succeeds.
    db._outbox_set(oid, next_attempt_at=datetime.now(timezone.utc).isoformat())
    second = email_sender.process_email_outbox()
    assert second == {"processed": 1, "sent": 1, "failed": 0}
    assert db.list_email_outbox()[0]["status"] == "sent"
    events = db.get_email_events()
    assert len(events) == 2  # failed attempt + successful retry
    assert [e["event"] for e in events] == ["sent", "failed"]


def test_worker_gives_up_after_max_attempts(db, monkeypatch):
    oid = db.enqueue_email("a@b.c", "Subject", "<p>Hi</p>")
    monkeypatch.setattr(email_sender, "_deliver", lambda *a, **k: (False, "down", ""))
    db._outbox_set(
        oid,
        attempts=4,
        status="failed",
        next_attempt_at=(datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat(),
    )

    result = email_sender.process_email_outbox(max_attempts=5)
    assert result["failed"] == 1
    assert db.list_email_outbox()[0]["attempts"] == 5

    # Past the cap: the row is no longer eligible.
    assert email_sender.process_email_outbox(max_attempts=5)["processed"] == 0


def test_bulk_mode_enqueues_instead_of_sending(db, monkeypatch):
    direct = []
    monkeypatch.setattr(
        consent_service, "send_html_email",
        lambda *a, **k: direct.append(a) or (True, ""),
    )
    with consent_service.bulk_enqueue_mode():
        ok, err = consent_service._dispatch_email(
            "a@b.c", "Subject", "<p>Hi</p>",
            related_type="consent", related_id="c-1",
        )
    assert ok is True and err == ""
    assert direct == []
    rows = db.list_email_outbox()
    assert len(rows) == 1
    assert rows[0]["status"] == "queued"
    assert db.count_pending_email_outbox() == 1


def test_bulk_mode_returns_error_when_enqueue_fails(db, monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("disk full")

    monkeypatch.setattr(consent_service, "enqueue_email", boom)
    with consent_service.bulk_enqueue_mode():
        ok, err = consent_service._dispatch_email("a@b.c", "Subject", "<p>Hi</p>")
    assert ok is False
    assert "disk full" in err


CSV_HEADER = "student_id,first_name,last_name,email,date_of_birth,grade_level,parent_email\n"


def _seed_admin(db) -> None:
    u = db.create_user("admin@school.edu", "Admin", "x", role_type="admin")
    conn = db.get_db()
    conn.execute("UPDATE users SET id = 'admin-001' WHERE id = ?", (u["id"],))
    conn.commit()
    conn.close()


def test_bulk_dispatch_enqueues_without_transport_and_worker_drains(db, monkeypatch):
    """Bulk roster dispatch never blocks on the ESP; the worker drains it."""
    from backend.services import roster_service

    _seed_admin(db)
    inst = db.create_institution("Big District", "secondary")
    body = "".join(
        f"U-{i},First{i},Last{i},user{i}@school.edu,2002-01-01,12,\n"
        for i in range(200)
    )
    summary = roster_service.upsert_roster(inst["id"], (CSV_HEADER + body).encode(), "admin-001")
    assert len(summary["student_ids"]) == 200

    transported = []
    monkeypatch.setattr(
        email_sender, "_deliver",
        lambda *a, **k: transported.append(1) or (True, "", "resend-x"),
    )
    result = consent_service.dispatch_consents_for_students(
        [s for s in (db.get_student_by_id(i) for i in summary["student_ids"]) if s],
        "admin-001",
    )
    assert result["created"] == 200
    assert result["dispatched"] == 200
    assert result["email_queued"] == 200
    assert transported == []  # nothing attempted synchronously
    assert db.count_pending_email_outbox() == 200

    drained = email_sender.process_email_outbox(batch_size=500)
    assert drained["sent"] == 200
    assert db.count_pending_email_outbox() == 0
    assert db.list_email_outbox(status="sent")[0]["esp_message_id"] == "resend-x"
