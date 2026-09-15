"""abandon stale outbox and assignment fix

Revision ID: 0007
Revises: 0006
Create Date: 2026-09-15

- Mark stale failed outbox rows as abandoned (never retried)
- No schema change for abandoned: status is free-text, worker excludes it
- Fix for counsellor assignment lastrowid bug is code-only (database.py)
"""

from typing import Sequence, Union

from alembic import op

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.exec_driver_sql(
        """
        UPDATE email_outbox
        SET status = 'abandoned',
            next_attempt_at = NULL,
            error = COALESCE(error, '') || ' [abandoned: stale 2026-09-15]'
        WHERE status = 'failed' AND (next_attempt_at IS NULL OR attempts >= 5)
        """
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.exec_driver_sql(
        """
        UPDATE email_outbox
        SET status = 'failed'
        WHERE status = 'abandoned' AND error LIKE '%[abandoned: stale 2026-09-15]%'
        """
    )
