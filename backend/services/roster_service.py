"""CSV roster ingestion with PII-at-rest protection (Delivery Brief §5).

Flow per row:
    normalize student_id -> SHA-256 hash (stored, never the raw ID)
    first/last/email/dob/parent fields -> AES-256-GCM encrypted blobs
    is_minor  -> age vs institution.minor_age_threshold (default 18);
                 rows without a parseable DOB are treated as minors
                 (conservative: parent consent always required)

Unknown rows are inserted, existing rows (matched on student_id_hash) are
upserted. Per-row failures are collected so one bad row never aborts the
whole upload.
"""

import csv
import io
import logging
from datetime import date, datetime

from backend import database
from backend.services import crypto

logger = logging.getLogger(__name__)

EXPECTED_HEADERS = [
    "student_id",
    "first_name",
    "last_name",
    "email",
    "date_of_birth",
    "grade_level",
    "parent_email",
]
REQUIRED_HEADERS = {"student_id", "first_name", "last_name", "email"}
_ALIASES = {
    "studentid": "student_id",
    "id": "student_id",
    "firstname": "first_name",
    "lastname": "last_name",
    "dob": "date_of_birth",
    "grade": "grade_level",
    "parentemail": "parent_email",
}

_DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y", "%b %d, %Y", "%d %B %Y")


def _parse_date(value: str) -> date | None:
    value = str(value or "").strip()
    if not value:
        return None
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def _normalize_headers(raw_headers: list[str]) -> list[str]:
    normalized = []
    for h in raw_headers:
        key = str(h).strip().strip("\ufeff").strip().lower()
        key = key.replace(" ", "_")
        normalized.append(_ALIASES.get(key, key))
    return normalized


def _age_years(dob: date, on: date | None = None) -> int:
    on = on or date.today()
    years = on.year - dob.year
    if (on.month, on.day) < (dob.month, dob.day):
        years -= 1
    return years


def _clean(value: str) -> str:
    return str(value or "").strip()


def parse_roster_csv(raw: bytes) -> tuple[list[dict], str | None]:
    """Parse CSV bytes into row dicts. Returns (rows, error)."""
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        return [], "File must be UTF-8 encoded."
    reader = csv.DictReader(io.StringIO(text))
    headers = _normalize_headers(reader.fieldnames or [])
    missing = REQUIRED_HEADERS - set(headers)
    if missing:
        return [], f"CSV is missing required column(s): {', '.join(sorted(missing))}"
    header_map = {orig: norm for orig, norm in zip(reader.fieldnames or [], headers)}
    rows = []
    for i, row in enumerate(reader, start=2):
        mapped = {header_map.get(k, k): v for k, v in row.items()}
        rows.append(mapped)
    return rows, None


def upsert_roster(
    institution_id: str,
    raw: bytes,
    created_by: str,
    minor_age_threshold: int = 18,
) -> dict:
    """Ingest a roster CSV. Returns a summary dict.

    Summary: {total, created, updated, errors: [{row, error}], skipped_minor_by_default}
    """
    rows, parse_error = parse_roster_csv(raw)
    summary: dict = {
        "total": len(rows),
        "created": 0,
        "updated": 0,
        "errors": [],
        "parse_error": parse_error,
        "skipped_minor_by_default": 0,
    }
    if parse_error or not rows:
        return summary

    for row in rows:
        err = _upsert_one(institution_id, row, created_by, minor_age_threshold, summary)
        if err:
            summary["errors"].append({"row": row, "error": err})

    return summary


def _upsert_one(institution_id, row, created_by, minor_age_threshold, summary) -> str | None:
    student_id = _clean(row.get("student_id"))
    first_name = _clean(row.get("first_name"))
    last_name = _clean(row.get("last_name"))
    email = _clean(row.get("email")).lower()
    grade_level = _clean(row.get("grade_level"))
    parent_email = _clean(row.get("parent_email")).lower()

    if not student_id or not first_name or not last_name or not email:
        return "student_id, first_name, last_name and email are required"

    dob = _parse_date(_clean(row.get("date_of_birth")))
    if dob is None and _clean(row.get("date_of_birth")):
        return f"unparseable date_of_birth: {row.get('date_of_birth')!r}"

    minor = True
    if dob is not None:
        minor = _age_years(dob) < minor_age_threshold
    else:
        summary["skipped_minor_by_default"] += 1

    name = f"{first_name} {last_name}".strip()
    id_hash = crypto.hash_student_id(student_id)
    existing = database.get_student_by_student_id_hash(id_hash)

    payload = dict(
        institution_id=institution_id,
        student_id_hash=id_hash,
        first_name_encrypted=crypto.encrypt_pii(name),
        email_encrypted=crypto.encrypt_pii(email),
        date_of_birth_encrypted=crypto.encrypt_pii(str(dob) if dob else ""),
        is_minor=minor,
        created_by=created_by,
        grade_level=grade_level or None,
    )
    if parent_email:
        payload["parent_email_encrypted"] = crypto.encrypt_pii(parent_email)
        payload["parent_first_name_encrypted"] = crypto.encrypt_pii(first_name)

    try:
        if existing:
            database.update_student(existing["id"], **payload)
            summary["updated"] += 1
        else:
            database.create_student(**payload)
            summary["created"] += 1
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("roster upsert failed for student_id=%s", student_id)
        return f"database error: {exc}"
    return None
