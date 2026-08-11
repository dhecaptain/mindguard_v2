"""revoked_tokens: persistent JWT blacklist

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-09

Token revocation previously lived in an in-memory module ``set`` (backend.auth),
so a logged-out token became valid again after a worker restart and revocation
was invisible to other processes. This migration adds a persistent
``revoked_tokens`` table so revocation survives restarts and is shared across
processes; rows are pruned opportunistically on write using ``expires_at``.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("revoked_tokens"):
        return
    op.create_table(
        "revoked_tokens",
        sa.Column("jti", sa.Text(), primary_key=True),
        sa.Column("revoked_at", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.Text(), nullable=True),
    )
    op.create_index("ix_revoked_tokens_expires_at", "revoked_tokens", ["expires_at"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("revoked_tokens"):
        op.drop_table("revoked_tokens")
