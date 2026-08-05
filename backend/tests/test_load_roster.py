"""Load contract tests (Delivery Brief §9.5).

Bulk upload of a 1000-row CSV: preview (parse) and commit (upsert) must both
complete well inside the 5-second budget. Bounds are intentionally generous —
the current implementation runs these in well under a second — so the test
catches accidental regressions (e.g. an accidental O(n^2) dedup) rather than
machine noise.
"""

import time

from backend.services import roster_service

CSV_HEADER = "student_id,student_first_name,student_email,date_of_birth,grade_level,parent_email\n"

PREVIEW_BUDGET_S = 5.0
COMMIT_BUDGET_S = 5.0
N_ROWS = 1000


def _big_csv(n: int) -> bytes:
    lines = [CSV_HEADER]
    for i in range(n):
        lines.append(
            f"S-{i:04d},Student{i},student{i:04d}@school.edu,"
            f"2010-{(i % 12) + 1:02d}-01,9,parent{i:04d}@school.edu"
        )
    return ("\n".join(lines) + "\n").encode("utf-8")


def test_preview_of_1000_rows_under_budget():
    raw = _big_csv(N_ROWS)
    start = time.perf_counter()
    rows, err = roster_service.parse_roster_csv(raw)
    elapsed = time.perf_counter() - start

    assert err is None
    assert len(rows) == N_ROWS
    assert elapsed < PREVIEW_BUDGET_S, f"1000-row preview took {elapsed:.2f}s (budget {PREVIEW_BUDGET_S}s)"


def test_commit_of_1000_rows_under_budget(db, monkeypatch):
    store = []

    def fake_send(to, subject, body, **kwargs):
        store.append(to)
        return True, ""

    from backend.services import consent_service

    monkeypatch.setattr(consent_service, "send_html_email", fake_send)

    u = db.create_user("admin@school.edu", "Admin", "x", role_type="admin")
    inst = db.create_institution("Riverside High", "secondary")

    start = time.perf_counter()
    summary = roster_service.upsert_roster(
        institution_id=inst["id"], raw=_big_csv(N_ROWS), created_by=u["id"]
    )
    elapsed = time.perf_counter() - start

    assert summary["parse_error"] is None
    assert summary["total"] == N_ROWS
    assert summary["errors"] == []
    assert len(summary["student_ids"]) == N_ROWS
    assert elapsed < COMMIT_BUDGET_S, f"1000-row commit took {elapsed:.2f}s (budget {COMMIT_BUDGET_S}s)"
