"""Tests for the pluggable secrets abstraction (Brief §11)."""

import backend.secrets_manager as secrets


def test_env_fallback(monkeypatch):
    monkeypatch.setenv("SAMPLE_TOKEN", "from-env")
    assert secrets.get_secret("SAMPLE_TOKEN") == "from-env"
    monkeypatch.delenv("SAMPLE_TOKEN")
    assert secrets.get_secret("SAMPLE_TOKEN") == ""


def test_default_returned_when_unset(monkeypatch):
    monkeypatch.delenv("NEVER_SET_SECRET", raising=False)
    assert secrets.get_secret("NEVER_SET_SECRET", default="fallback") == "fallback"


def test_file_env_loader(monkeypatch, tmp_path):
    secret_file = tmp_path / "jwt_secret.txt"
    secret_file.write_text("file-secret\n")
    monkeypatch.setenv("MY_SECRET_FILE", str(secret_file))
    assert secrets.get_secret("MY_SECRET") == "file-secret"


def test_secrets_dir_loader(monkeypatch, tmp_path):
    (tmp_path / "ES_API_KEY").write_text("dir-secret")
    monkeypatch.setenv("SECRETS_FILE_DIR", str(tmp_path))
    assert secrets.get_secret("ES_API_KEY") == "dir-secret"


def test_file_preferred_over_env(monkeypatch, tmp_path):
    secret_file = tmp_path / "both.txt"
    secret_file.write_text("from-file\n")
    monkeypatch.setenv("BOTH_SECRET_FILE", str(secret_file))
    monkeypatch.setenv("BOTH_SECRET", "from-env")
    assert secrets.get_secret("BOTH_SECRET") == "from-file"


def test_registered_loader_takes_priority(monkeypatch):
    monkeypatch.setenv("PRIO_SECRET", "from-env")
    secrets.register_loader(lambda name: "from-custom" if name == "PRIO_SECRET" else None)
    try:
        assert secrets.get_secret("PRIO_SECRET") == "from-custom"
    finally:
        secrets._LOADERS.clear()


def test_file_env_missing_falls_back(monkeypatch):
    monkeypatch.setenv("MISSING_FILE_SECRET_FILE", "/nonexistent/secret")
    monkeypatch.setenv("MISSING_FILE_SECRET", "env-value")
    assert secrets.get_secret("MISSING_FILE_SECRET") == "env-value"
