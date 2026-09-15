"""social accounts and counsellor-student assignments

Revision ID: 0006
Revises: 0005
Create Date: 2026-09-13

Adds:
- student_social_accounts: stores social media handles per student
- counsellor_student_assignments: explicit counsellor-student assignments
- counsellors table: admin-managed counsellor accounts

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── student_social_accounts ─────────────────────────────────────────
    op.create_table(
        "student_social_accounts",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("student_id", sa.Text(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("platform", sa.Text(), nullable=False),
        sa.Column("handle", sa.Text(), nullable=True),
        sa.Column("profile_url", sa.Text(), nullable=True),
        sa.Column("active", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.UniqueConstraint("student_id", "platform", name="uq_student_platform"),
    )
    op.create_index(
        "idx_social_accounts_student",
        "student_social_accounts",
        ["student_id"],
    )

    # ── counsellor_student_assignments ──────────────────────────────────
    op.create_table(
        "counsellor_student_assignments",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("counsellor_id", sa.Text(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("student_id", sa.Text(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("institution_id", sa.Text(), sa.ForeignKey("institutions.id"), nullable=True),
        sa.Column("assigned_by", sa.Text(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("assigned_at", sa.Text(), nullable=False),
        sa.Column("unassigned_at", sa.Text(), nullable=True),
        sa.Column("active", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("counsellor_id", "student_id", name="uq_counsellor_student"),
    )
    op.create_index(
        "idx_assignments_counsellor",
        "counsellor_student_assignments",
        ["counsellor_id"],
    )
    op.create_index(
        "idx_assignments_student",
        "counsellor_student_assignments",
        ["student_id"],
    )


def downgrade() -> None:
    op.drop_index("idx_assignments_student", table_name="counsellor_student_assignments")
    op.drop_index("idx_assignments_counsellor", table_name="counsellor_student_assignments")
    op.drop_table("counsellor_student_assignments")
    op.drop_index("idx_social_accounts_student", table_name="student_social_accounts")
    op.drop_table("student_social_accounts")
