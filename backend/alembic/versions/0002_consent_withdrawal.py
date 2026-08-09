"""analyses.consent_withdrawn_at

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-07

When a consent is revoked, existing analyses for that subject are stamped with
``consent_withdrawn_at`` instead of being silently deleted (Delivery Brief
§2.8). This migration adds the additive column; the app writes it through
``database.mark_analyses_consent_withdrawn``.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if any(c["name"] == "consent_withdrawn_at" for c in inspector.get_columns("analyses")):
        return
    op.add_column("analyses", sa.Column("consent_withdrawn_at", sa.Text(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if any(c["name"] == "consent_withdrawn_at" for c in inspector.get_columns("analyses")):
        op.drop_column("analyses", "consent_withdrawn_at")
