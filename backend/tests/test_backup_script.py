"""Tests for the SQLite backup script (ops: nightly snapshots)."""

import gzip
import sqlite3
from pathlib import Path

import backend.scripts.backup_db as backup_db
from backend.database import init_db


def _make_db(path: Path) -> None:
    import backend.database as database

    old = database.DB_PATH
    database.DB_PATH = path
    try:
        init_db()
    finally:
        database.DB_PATH = old


def _run(monkeypatch, backup_dir: str) -> int:
    monkeypatch.setattr("sys.argv", ["backup_db.py", backup_dir])
    return backup_db.main()


def test_backup_writes_consistent_snapshot(tmp_path, monkeypatch):
    db = tmp_path / "mindguard.db"
    _make_db(db)
    monkeypatch.setattr(backup_db, "DB_PATH", db)

    out = tmp_path / "backups"
    assert _run(monkeypatch, str(out)) == 0

    snapshots = list(out.glob("mindguard-*.db.gz"))
    assert len(snapshots) == 1

    restored = tmp_path / "restored.db"
    with gzip.open(snapshots[0], "rb") as fh_in, restored.open("wb") as fh_out:
        fh_out.write(fh_in.read())

    conn = sqlite3.connect(str(restored))
    try:
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
    finally:
        conn.close()
    assert any("users" in t for t in tables)


def test_backup_rotation_keeps_only_latest(tmp_path, monkeypatch):
    db = tmp_path / "mindguard.db"
    _make_db(db)
    monkeypatch.setattr(backup_db, "DB_PATH", db)
    monkeypatch.setenv("BACKUP_KEEP", "2")

    out = tmp_path / "backups"
    for _ in range(3):
        assert _run(monkeypatch, str(out)) == 0

    snapshots = sorted(out.glob("mindguard-*.db.gz"))
    assert len(snapshots) == 2


def test_backup_fails_when_db_missing(tmp_path, monkeypatch):
    monkeypatch.setattr(backup_db, "DB_PATH", tmp_path / "nope.db")
    assert _run(monkeypatch, str(tmp_path / "backups")) == 1
