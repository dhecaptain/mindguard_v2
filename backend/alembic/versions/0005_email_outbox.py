"""email_outbox: durable outbox table backing the email send queue

Revision ID: 0005
Revises: 0004
Create Date: 2026-08-13

Remediation P1-1 introduces a write-ahead email outbox. Every outgoing
message is persisted here (recipient encrypted at rest, plus a deterministic
hash for joins) before the ESP is contacted, and an in-process worker drains
``queued`` rows with retry/backoff. The table is append-only for observability:
rows transition ``queued -> sent | failed`` and are never deleted.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "email_outbox",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("to_email", sa.Text(), nullable=False),
        sa.Column("to_email_hash", sa.Text(), nullable=True),
        sa.Column("subject", sa.Text(), nullable=False),
        sa.Column("body_html", sa.Text(), nullable=False),
        sa.Column("related_type", sa.Text(), nullable=True),
        sa.Column("related_id", sa.Text(), nullable=True),
        sa.Column("metadata_json", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="queued"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("esp_message_id", sa.Text(), nullable=True),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("sent_at", sa.Text(), nullable=True),
        sa.Column("next_attempt_at", sa.Text(), nullable=True),
    )
    op.create_index(
        "idx_email_outbox_due",
        "email_outbox",
        ["status", "next_attempt_at"],
    )


def downgrade() -> None:
    op.drop_index("idx_email_outbox_due", table_name="email_outbox")
    op.drop_table("email_outbox")
