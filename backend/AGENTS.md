# Backend Rules — mindguard_v2/backend

- All async handlers must `await write_audit(db, ...)` before return. God node `write_audit()` — 29 edges, never skip.
- `get_db()` is god node (108 edges) — always use dependency `Depends(get_db)` never instantiate DB directly.
- Consent gate: `consent_gate.enforce()` must wrap every analysis path. Check `ENFORCE_CONSENT_ANALYSIS=true`.
- PII encryption: `crypto.encrypt_pii()` before `db.add(Student)`. Use `secrets_manager.get_secret()` not `os.getenv` directly.
- Structured logging: `logging_setup.get_logger(__name__)` + `extra={"request_id": g.request_id}`. Tail is `logs/dev.log`.
- Never log PII or raw `JWT_SECRET`. Audit `USER_PROMOTED` on bootstrap promotions.
- Tests: `PYTHONPATH=..:. python3 -m pytest -q` must be green before commit. Watch mode pipes to `logs/dev.log` for agent eyes.
- Migrations: `alembic revision --autogenerate` then `test_schema_m1.py` style check.
