"""Pluggable secret resolution (Delivery Brief §11).

A small abstraction over how sensitive values are resolved (JWT signing key,
encryption key, email/ESP keys, webhook secrets, OAuth client secrets). Today
secrets come from environment variables (optionally mounted as files via
``SECRETS_FILE_DIR``); swapping to AWS Secrets Manager / a vault later is a
matter of registering a loader here — not editing call sites.

Conventions:
* ``get_secret(name, default)`` — the only accessor call sites should use.
* Loaders registered via :func:`register_loader` are consulted first (last
  registered wins). The built-in file loader (``SECRETS_FILE_DIR``) and env
  loader are always consulted as fallbacks, in that order.
* ``SECRETS_FILE_DIR`` — optional directory of files named after the secret
  (12-factor style, e.g. ``/run/secrets/JWT_SECRET``). A ``*_FILE`` env var
  (e.g. ``JWT_SECRET_FILE``) pointing at a single file is also honoured.
"""

import os
from typing import Callable

from dotenv import load_dotenv

# Load the root .env up-front so every caller of get_secret works regardless of
# import order. Idempotent: load_dotenv() finds the file only once.
load_dotenv()

# A loader resolves a secret name to its value, or None when not configured.
SecretLoader = Callable[[str], str | None]


def _env_loader(name: str) -> str | None:
    value = os.getenv(name)
    return value if value else None


def _file_env_loader(name: str) -> str | None:
    # 12-factor: JWT_SECRET_FILE=/run/secrets/jwt → read the file.
    file_env = os.getenv(f"{name}_FILE", "")
    if file_env and os.path.isfile(file_env):
        with open(file_env, encoding="utf-8") as fh:
            return fh.read().strip() or None
    return None


def _dir_file_loader(name: str) -> str | None:
    # SECRETS_FILE_DIR=/run/secrets with a file named after the secret.
    root = os.getenv("SECRETS_FILE_DIR", "")
    if not root:
        return None
    path = os.path.join(root, name)
    if not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8") as fh:
        return fh.read().strip() or None


_BUILTINS = (_file_env_loader, _dir_file_loader, _env_loader)
_LOADERS: list[SecretLoader] = []


def register_loader(loader: SecretLoader) -> None:
    """Register a custom loader; it takes priority over built-ins and earlier
    registrations (first non-None value returned wins)."""
    _LOADERS.insert(0, loader)


def get_secret(name: str, default: str = "") -> str:
    """Resolve ``name`` through registered loaders then the built-in chain.

    Returns ``default`` when no loader supplies a value.
    """
    for loader in list(_LOADERS) + list(_BUILTINS):
        try:
            value = loader(name)
        except OSError:
            value = None
        if value is not None:
            return value
    return default
