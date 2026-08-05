"""Snapshot the MindGuard SQLite database to a dated, compressed file.

Uses sqlite3's online backup API so the copy is consistent even while the app
is running. Keeps a rotating set of local snapshots and, when ``BACKUP_S3_BUCKET``
is set, uploads each snapshot to S3-compatible storage (boto3 required).

Usage:
    PYTHONPATH=..:. python3 scripts/backup_db.py [backup_dir]

Environment:
    MINDGUARD_DB_DIR     directory holding mindguard.db (default: repo parent)
    BACKUP_S3_BUCKET     e.g. "mindguard-backups" to also upload a copy
    BACKUP_S3_PREFIX     object key prefix (default: "mindguard/db")
    BACKUP_KEEP          number of local snapshots to retain (default: 7)
    AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_ENDPOINT_URL (MinIO/Backblaze)

Exit code 0 on success, 1 on failure. Intended for a nightly cron job.
"""

import argparse
import datetime as _dt
import gzip
import os
import shutil
import sqlite3
import sys
from pathlib import Path

from backend.database import DB_PATH

S3_ENDPOINT_ENV = "AWS_ENDPOINT_URL"


def _s3_enabled() -> bool:
    return bool(os.getenv("BACKUP_S3_BUCKET"))


def _write_snapshot(src: Path, dest: Path) -> None:
    """Stream the live DB into a gzip-compressed snapshot via the backup API."""
    raw_tmp = dest.with_suffix(".db")
    src_conn = sqlite3.connect(f"file:{src}?mode=ro", uri=True)
    try:
        raw_conn = sqlite3.connect(str(raw_tmp))
        try:
            src_conn.backup(raw_conn)
        finally:
            raw_conn.close()
        with raw_tmp.open("rb") as fh_in, gzip.open(dest, "wb") as fh_out:
            shutil.copyfileobj(fh_in, fh_out)
    finally:
        src_conn.close()
        raw_tmp.unlink(missing_ok=True)


def _upload_to_s3(snapshot: Path) -> None:
    try:
        import boto3
    except ImportError as exc:
        raise RuntimeError(
            "BACKUP_S3_BUCKET is set but boto3 is not installed; "
            "pip install boto3 to enable offsite backups."
        ) from exc

    bucket = os.environ["BACKUP_S3_BUCKET"]
    prefix = os.getenv("BACKUP_S3_PREFIX", "mindguard/db").strip("/")
    kwargs = {}
    if os.getenv(S3_ENDPOINT_ENV):
        kwargs["endpoint_url"] = os.getenv(S3_ENDPOINT_ENV)
    client = boto3.client("s3", **kwargs)
    key = f"{prefix}/{snapshot.name}"
    client.upload_file(str(snapshot), bucket, key)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "backup_dir",
        nargs="?",
        default=str(Path.cwd() / "backups"),
        help="Directory to write snapshots into (default: ./backups)",
    )
    args = parser.parse_args()

    if not DB_PATH.exists():
        print(f"[backup] ERROR: database not found at {DB_PATH}", file=sys.stderr)
        return 1

    out_dir = Path(args.backup_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    stamp = _dt.datetime.now(_dt.timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    snapshot = out_dir / f"mindguard-{stamp}.db.gz"
    tmp = out_dir / f".mindguard-{stamp}.tmp"

    try:
        _write_snapshot(DB_PATH, tmp)
        shutil.move(str(tmp), str(snapshot))
    except Exception as exc:
        tmp.unlink(missing_ok=True)
        print(f"[backup] ERROR: {exc}", file=sys.stderr)
        return 1

    keep = max(1, int(os.getenv("BACKUP_KEEP", "7")))
    old = sorted(out_dir.glob("mindguard-*.db.gz"), reverse=True)
    for stale in old[keep:]:
        stale.unlink()

    if _s3_enabled():
        try:
            _upload_to_s3(snapshot)
        except Exception as exc:
            print(f"[backup] ERROR (local snapshot kept at {snapshot}): {exc}", file=sys.stderr)
            return 1

    print(f"[backup] wrote {snapshot} ({snapshot.stat().st_size} bytes); kept {keep}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
