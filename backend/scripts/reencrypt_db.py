"""Re-encrypt all PII at rest under a new ENCRYPTION_KEY (Remediation P2-6).

Single-key AES-256-GCM means rotating the key requires re-encrypting every
ciphertext blob. Run in a maintenance window with the app stopped:

    OLD_ENCRYPTION_KEY=<64-hex> NEW_ENCRYPTION_KEY=<64-hex> \
      PYTHONPATH=..:. python3 scripts/reencrypt_db.py

Steps performed:
  1. Verify both keys are 64 hex chars.
  2. For every row in the known PII columns, decrypt with the old key and
     re-encrypt with the new one (writes back in place, one row at a time).
  3. Verify the whole table reads back correctly under the new key.
  4. Write the new key to the app's ``.encryption_key`` file (the path the app
     uses when ``ENCRYPTION_KEY`` is unset), and remind the operator to update
     the ``ENCRYPTION_KEY`` env var too.

Key-independent hashes (``student_id_hash``, ``*_email_hash``,
``signed_token_hash``) are untouched. Exit code 0 on success.

Safety: always take a backup snapshot first (``scripts/backup_db.py``).
"""

import os
import sqlite3
import sys

from backend.database import DB_PATH
from backend.services import crypto

# (table, (columns...)) — every column that may hold a `gcm1:` ciphertext blob.
PII_COLUMNS = {
    "students": (
        "first_name_encrypted",
        "email_encrypted",
        "date_of_birth_encrypted",
        "parent_email_encrypted",
        "parent_first_name_encrypted",
    ),
    "consents": ("recipient_email",),
    "email_events": ("recipient_email",),
    "demo_requests": ("full_name", "work_email", "organisation"),
}


def _require_hex(name: str, value: str) -> str:
    value = (value or "").strip()
    if crypto._bytes_from_hex(value) is None:
        print(
            f"{name} must be 64 hex characters (32 bytes). Got {len(value)} chars.",
            file=sys.stderr,
        )
        sys.exit(1)
    return value


def _columns_present(conn: sqlite3.Connection, table: str) -> list[str]:
    cols = {row[1] for row in conn.execute(f"PRAGMA table_info({table})")}
    return [c for c in PII_COLUMNS[table] if c in cols]


def _reencrypt_column(
    conn: sqlite3.Connection, table: str, column: str, new_key: str, total: list[int]
) -> int:
    """Decrypt every blob under the old key, then re-encrypt under the new one."""
    rows = conn.execute(f"SELECT id, {column} FROM {table}").fetchall()
    pairs = [(rid, crypto.decrypt_pii(blob)) for rid, blob in rows
             if blob and blob.startswith(crypto._PII_PREFIX)]
    if not pairs:
        return 0
    crypto._ENCRYPTION_KEY_HEX = new_key
    for rid, plaintext in pairs:
        conn.execute(
            f"UPDATE {table} SET {column} = ? WHERE id = ?",
            (crypto.encrypt_pii(plaintext), rid),
        )
    total[0] += len(pairs)
    return len(pairs)


def _verify_column(conn: sqlite3.Connection, table: str, column: str) -> int:
    bad = 0
    for rid, blob in conn.execute(f"SELECT id, {column} FROM {table}"):
        if not blob or not blob.startswith(crypto._PII_PREFIX):
            continue
        try:
            crypto.decrypt_pii(blob)
        except Exception:
            bad += 1
            print(f"  ! {table}.{column} row {rid} failed decryption under new key", file=sys.stderr)
    return bad


def main() -> int:
    old_key = _require_hex("OLD_ENCRYPTION_KEY", os.getenv("OLD_ENCRYPTION_KEY", ""))
    new_key = _require_hex("NEW_ENCRYPTION_KEY", os.getenv("NEW_ENCRYPTION_KEY", ""))
    if old_key == new_key:
        sys.exit("OLD_ENCRYPTION_KEY and NEW_ENCRYPTION_KEY must differ.")

    if not DB_PATH.exists():
        sys.exit(f"Database not found at {DB_PATH}. Set MINDGUARD_DB_DIR if needed.")

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        crypto._ENCRYPTION_KEY_HEX = old_key
        total = [0]
        for table in PII_COLUMNS:
            for column in _columns_present(conn, table):
                changed = _reencrypt_column(conn, table, column, new_key, total)
                if changed:
                    print(f"  re-encrypted {changed} row(s) in {table}.{column}")
                crypto._ENCRYPTION_KEY_HEX = old_key
        conn.commit()

        crypto._ENCRYPTION_KEY_HEX = new_key
        bad = 0
        for table in PII_COLUMNS:
            for column in _columns_present(conn, table):
                bad += _verify_column(conn, table, column)
    finally:
        conn.close()

    if bad:
        sys.exit(f"Verification failed for {bad} blob(s). Restore from backup and retry.")

    try:
        crypto._KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
        crypto._KEY_FILE.write_text(new_key, encoding="utf-8")
        os.chmod(crypto._KEY_FILE, 0o600)
        print(f"  wrote new key to {crypto._KEY_FILE}")
    except OSError as exc:
        print(f"  ! could not write key file: {exc}", file=sys.stderr)

    print(f"Rotation complete: {total[0]} blob(s) re-encrypted.")
    print("Update ENCRYPTION_KEY to the new value and redeploy, then run the test suite.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
