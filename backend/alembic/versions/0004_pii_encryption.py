"""pii_encryption: encrypt recipient emails and demo-request PII at rest

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-12

Delivery Brief §8 requires PII (name, email, DOB, parent fields) encrypted at
rest. ``students`` already encrypts; this migration extends that to:

- ``consents.recipient_email``
- ``email_events.recipient_email``
- ``demo_requests.full_name`` / ``work_email`` / ``organisation``

Each gains a deterministic SHA-256 hash column (``*_email_hash``) so the
delivery-status joins and consent-tracker email search keep working without
comparing plaintext. Existing plaintext rows are encrypted in place and audit /
consent-event payloads are redacted. The migration runs under the app's own
crypto key, so it must execute in-process (as ``database.run_migrations`` does).
"""
import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from backend.services.crypto import encrypt_pii, hash_email, redact_pii

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_PREFIX = "gcm1:"


def _encrypt_pairs(bind, table: str, columns: tuple) -> None:
    """Encrypt each column in ``columns`` (and hash the ``*_email`` ones) per row."""
    select_cols = ["id", *columns]
    rows = bind.execute(sa.text(f"SELECT {', '.join(select_cols)} FROM {table}")).fetchall()
    for row in rows:
        rid = row[0]
        sets, params = [], {}
        for idx, col in enumerate(columns):
            value = row[idx + 1]
            if not value or (isinstance(value, str) and value.startswith(_PREFIX)):
                continue
            sets.append(f"{col} = :p{idx}")
            params[f"p{idx}"] = encrypt_pii(value)
            if col.endswith("_email") or col == "work_email":
                sets.append(f"{col}_hash = :p{idx}_hash")
                params[f"p{idx}_hash"] = hash_email(value)
        if sets:
            bind.execute(
                sa.text(f"UPDATE {table} SET {', '.join(sets)} WHERE id = :rid"),
                {**params, "rid": rid},
            )


def _redact_json(bind, table: str, column: str) -> None:
    rows = bind.execute(sa.text(f"SELECT id, {column} FROM {table}")).fetchall()
    for rid, raw in rows:
        if not raw:
            continue
        try:
            new = json.dumps(redact_pii(json.loads(raw)))
        except (ValueError, TypeError):
            continue
        if new != raw:
            bind.execute(
                sa.text(f"UPDATE {table} SET {column} = :v WHERE id = :rid"),
                {"v": new, "rid": rid},
            )


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "recipient_email_hash" not in [c["name"] for c in inspector.get_columns("consents")]:
        op.add_column("consents", sa.Column("recipient_email_hash", sa.Text(), nullable=True))
    if "recipient_email_hash" not in [c["name"] for c in inspector.get_columns("email_events")]:
        op.add_column("email_events", sa.Column("recipient_email_hash", sa.Text(), nullable=True))
    if "work_email_hash" not in [c["name"] for c in inspector.get_columns("demo_requests")]:
        op.add_column("demo_requests", sa.Column("work_email_hash", sa.Text(), nullable=True))

    _encrypt_pairs(bind, "consents", ("recipient_email",))
    _encrypt_pairs(bind, "email_events", ("recipient_email",))
    _encrypt_pairs(bind, "demo_requests", ("full_name", "work_email", "organisation"))

    _redact_json(bind, "audit_log", "payload_json")
    _redact_json(bind, "consent_events", "metadata_json")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = {c["name"] for c in inspector.get_columns("consents")}
    if "recipient_email_hash" in cols:
        op.drop_column("consents", "recipient_email_hash")
    cols = {c["name"] for c in inspector.get_columns("email_events")}
    if "recipient_email_hash" in cols:
        op.drop_column("email_events", "recipient_email_hash")
    cols = {c["name"] for c in inspector.get_columns("demo_requests")}
    if "work_email_hash" in cols:
        op.drop_column("demo_requests", "work_email_hash")
