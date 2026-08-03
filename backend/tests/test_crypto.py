"""Crypto module tests — PII encryption + signed consent tokens (Brief §8)."""

import pytest

from services import crypto


def test_encrypt_decrypt_roundtrip():
    plain = "Jane Doe <jane@school.edu>"
    blob = crypto.encrypt_pii(plain)
    assert blob.startswith("gcm1:")
    assert blob != plain
    assert crypto.decrypt_pii(blob) == plain


def test_decrypt_empty():
    assert crypto.decrypt_pii("") == ""


def test_encrypt_is_nondeterministic():
    plain = "same value"
    assert crypto.encrypt_pii(plain) != crypto.encrypt_pii(plain)


def test_decrypt_tampered_blob_raises():
    blob = crypto.encrypt_pii("secret")
    tampered = blob[:-4] + ("0000" if not blob.endswith("0000") else "1111")
    with pytest.raises(Exception):
        crypto.decrypt_pii(tampered)


def test_decrypt_non_blob_raises():
    with pytest.raises(ValueError):
        crypto.decrypt_pii("plaintext!")


def test_hash_student_id_normalises():
    assert crypto.hash_student_id("  S-1042 ") == crypto.hash_student_id("s-1042")
    assert len(crypto.hash_student_id("S-1042")) == 64


def test_hash_token_length():
    assert len(crypto.hash_token("anything")) == 64


def test_signed_token_verifies_for_correct_consent():
    token = crypto.create_signed_token("consent-abc")
    assert crypto.verify_signed_token(token, "consent-abc") is True


def test_signed_token_rejected_for_wrong_consent():
    token = crypto.create_signed_token("consent-abc")
    assert crypto.verify_signed_token(token, "consent-other") is False


def test_signed_token_tampering_rejected():
    token = crypto.create_signed_token("consent-abc")
    assert crypto.verify_signed_token(token + "x", "consent-abc") is False
    # flip a character in the mac portion
    parts = token.split(".")
    parts[2] = ("A" if parts[2][0] != "A" else "B") + parts[2][1:]
    assert crypto.verify_signed_token(".".join(parts), "consent-abc") is False


def test_signed_token_garbage_rejected():
    assert crypto.verify_signed_token("garbage", "consent-abc") is False


def test_tokens_are_unique():
    assert crypto.create_signed_token("consent-abc") != crypto.create_signed_token("consent-abc")


def test_dev_key_generated_when_env_unset(tmp_path, monkeypatch):
    monkeypatch.setattr(crypto, "_ENCRYPTION_KEY_HEX", "")
    monkeypatch.setattr(crypto, "_KEY_FILE", tmp_path / ".encryption_key")
    blob = crypto.encrypt_pii("dev-only")
    assert crypto.decrypt_pii(blob) == "dev-only"
    assert tmp_path.joinpath(".encryption_key").exists()


def test_invalid_env_key_raises(monkeypatch):
    monkeypatch.setattr(crypto, "_ENCRYPTION_KEY_HEX", "not-hex")
    with pytest.raises(RuntimeError):
        crypto.encrypt_pii("x")
