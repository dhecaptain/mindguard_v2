import os

import pytest

# Point the DB and crypto key at per-session temp locations before importing.
os.environ.setdefault("MINDGUARD_DB_DIR", "")
os.environ.setdefault("ENCRYPTION_KEY", "a" * 64)

from backend import database  # noqa: E402
from backend.services import crypto  # noqa: E402


@pytest.fixture()
def db(tmp_path, monkeypatch):
    """Fresh, isolated SQLite DB with schema applied (idempotent)."""
    monkeypatch.setattr(database, "DB_PATH", tmp_path / "test_mindguard.db")
    database.init_db()
    return database


@pytest.fixture(autouse=True)
def crypto_key(tmp_path, monkeypatch):
    """Deterministic test encryption key, isolated per test."""
    monkeypatch.setattr(crypto, "_ENCRYPTION_KEY_HEX", "b" * 64)
    monkeypatch.setattr(crypto, "_KEY_FILE", tmp_path / ".encryption_key")
    yield
