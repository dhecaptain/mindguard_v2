"""adult self-analysis: session status/progress and account credentials

Revision ID: 0010
Revises: 0009
Create Date: 2026-09-16

Adds the columns the adult wellbeing self-analysis flow needs:

- ``analysis_sessions.status``        — running / completed / partial / no_data / failed
- ``analysis_sessions.progress_json`` — live per-platform progress during a run
- ``analysis_sessions.error_json``    — per-platform error details

- ``student_social_accounts.credentials_json``    — AES-GCM encrypted secrets (Bluesky App Password, ...)
- ``student_social_accounts.verification_status`` — pending / verified / failed / not_supported
- ``student_social_accounts.verified_handle``      — canonical handle after normalization
- ``student_social_accounts.verified_profile_url``
- ``student_social_accounts.last_verified_at``
- ``student_social_accounts.analysis_status``      — not_run / ready / requires_credentials / analyzed / no_data / failed
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0010"
down_revision: Union[str, None] = "0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for col in ["status", "progress_json", "error_json"]:
        try:
            op.add_column(
                "analysis_sessions",
                sa.Column(col, sa.Text(), nullable=True),
            )
        except Exception:
            pass
    try:
        op.execute("UPDATE analysis_sessions SET status = 'completed' WHERE status IS NULL")
    except Exception:
        pass
    try:
        op.create_index("idx_sessions_status", "analysis_sessions", ["status"])
    except Exception:
        pass

    for col in [
        "credentials_json",
        "verification_status",
        "verified_handle",
        "verified_profile_url",
        "last_verified_at",
        "analysis_status",
    ]:
        try:
            op.add_column(
                "student_social_accounts",
                sa.Column(col, sa.Text(), nullable=True),
            )
        except Exception:
            pass
    try:
        op.execute("UPDATE student_social_accounts SET verification_status = 'pending' WHERE verification_status IS NULL")
        op.execute("UPDATE student_social_accounts SET analysis_status = 'not_run' WHERE analysis_status IS NULL")
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_index("idx_sessions_status", table_name="analysis_sessions")
    except Exception:
        pass
    for col in ["error_json", "progress_json", "status"]:
        try:
            op.drop_column("analysis_sessions", col)
        except Exception:
            pass
    for col in [
        "analysis_status",
        "last_verified_at",
        "verified_profile_url",
        "verified_handle",
        "verification_status",
        "credentials_json",
    ]:
        try:
            op.drop_column("student_social_accounts", col)
        except Exception:
            pass