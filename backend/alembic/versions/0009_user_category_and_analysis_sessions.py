"""user category, institution link, analysis sessions

Revision ID: 0009
Revises: 0008
Create Date: 2026-09-15

Adds user_category/institution linkage and durable analysis_sessions.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for col, typ in [
        ("user_category", sa.Text()),
        ("institution_id", sa.Text()),
        ("parent_guardian_id", sa.Text()),
        ("onboarding_completed_at", sa.Text()),
    ]:
        try:
            op.add_column("users", sa.Column(col, typ, nullable=True))
        except Exception:
            pass
    try:
        op.create_index("idx_users_institution", "users", ["institution_id"])
    except Exception:
        pass
    try:
        op.create_index("idx_users_category", "users", ["user_category"])
    except Exception:
        pass

    op.create_table(
        "analysis_sessions",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("student_id", sa.Text(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("counsellor_id", sa.Text(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("institution_id", sa.Text(), sa.ForeignKey("institutions.id"), nullable=True),
        sa.Column("consent_id", sa.Text(), sa.ForeignKey("consents.id"), nullable=True),
        sa.Column("started_at", sa.Text(), nullable=False),
        sa.Column("completed_at", sa.Text(), nullable=True),
        sa.Column("analysis_type", sa.Text(), nullable=False, server_default="social_wellbeing"),
        sa.Column("platforms_json", sa.Text(), nullable=True),
        sa.Column("findings_json", sa.Text(), nullable=True),
        sa.Column("risk_score", sa.Float(), nullable=True),
        sa.Column("insights", sa.Text(), nullable=True),
        sa.Column("recommendations", sa.Text(), nullable=True),
        sa.Column("counsellor_notes", sa.Text(), nullable=True),
        sa.Column("follow_up_status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
    )
    op.create_index("idx_sessions_student", "analysis_sessions", ["student_id"])
    op.create_index("idx_sessions_counsellor", "analysis_sessions", ["counsellor_id"])
    op.create_index("idx_sessions_institution", "analysis_sessions", ["institution_id"])


def downgrade() -> None:
    op.drop_index("idx_sessions_institution", table_name="analysis_sessions")
    op.drop_index("idx_sessions_counsellor", table_name="analysis_sessions")
    op.drop_index("idx_sessions_student", table_name="analysis_sessions")
    op.drop_table("analysis_sessions")
    try:
        op.drop_index("idx_users_category", table_name="users")
    except Exception:
        pass
    try:
        op.drop_index("idx_users_institution", table_name="users")
    except Exception:
        pass
    for col in ["onboarding_completed_at", "parent_guardian_id", "institution_id", "user_category"]:
        try:
            op.drop_column("users", col)
        except Exception:
            pass
