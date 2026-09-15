"""counsellor invitation magic-link

Revision ID: 0008
Revises: 0007
Create Date: 2026-09-15

Adds invitation columns to users for secure magic-link flow.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for col in ["invitation_token_hash", "invitation_expires_at", "invited_at"]:
        try:
            op.add_column("users", sa.Column(col, sa.Text(), nullable=True))
        except Exception:
            pass


def downgrade() -> None:
    for col in ["invitation_token_hash", "invitation_expires_at", "invited_at"]:
        try:
            op.drop_column("users", col)
        except Exception:
            pass
