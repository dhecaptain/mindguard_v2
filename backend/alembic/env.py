"""Alembic environment for the MindGuard backend.

The DB location is owned by ``backend.database.DB_PATH`` (derived from
``MINDGUARD_DB_DIR``). ``run_migrations()`` injects ``sqlalchemy.url`` into the
Alembic ``Config`` before ``upgrade`` is called, so this env resolves the exact
same SQLite file the application writes to — including under tests, where
``database.DB_PATH`` is monkeypatched to a temp file.
"""

from alembic import context
from sqlalchemy import create_engine

# No fileConfig() call on purpose: the application owns logging setup.
# Importing the app metadata models is not required — the project uses raw
# SQLAlchemy DDL in migrations against an existing SQLite schema.

config = context.config


def _url() -> str:
    url = config.get_main_option("sqlalchemy.url")
    if url:
        return url
    import os
    from pathlib import Path

    db_dir = os.getenv("MINDGUARD_DB_DIR", str(Path(__file__).resolve().parent.parent.parent))
    return f"sqlite:///{Path(db_dir) / 'mindguard.db'}"


def run_migrations_offline() -> None:
    context.configure(
        url=_url(),
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(_url())
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=None,
            render_as_batch=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
