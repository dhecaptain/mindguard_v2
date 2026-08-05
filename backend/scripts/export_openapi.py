"""Export the OpenAPI document to openapi.json.

The spec is the migration contract between the current Railway backend and the
Phase 2 target (Delivery Brief §11): a backend that implements this file should
satisfy the same API contract, which is also pinned by tests/test_openapi_contract.py.

Usage:
    PYTHONPATH=..:. python3 scripts/export_openapi.py [out_path]
"""

import json
import sys
from pathlib import Path

import os

os.environ.setdefault("JWT_SECRET", "openapi-export-tmp")  # needed at import

from backend.main import app  # noqa: E402

DEFAULT_OUT = Path(__file__).resolve().parent.parent.parent / "openapi.json"


def main() -> int:
    out_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUT
    spec = app.openapi()
    out_path.write_text(json.dumps(spec, indent=2, default=str), encoding="utf-8")
    print(f"Wrote OpenAPI {spec['openapi']} ({len(spec['paths'])} paths) -> {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
