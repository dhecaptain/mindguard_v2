"""Tests for the pre-import inference memory guard (free-tier OOM protection)."""

import pytest

from backend.services.predictor import _ensure_memory_headroom, _mem_available_mb


def test_mem_available_reads_proc(monkeypatch, tmp_path):
    meminfo = tmp_path / "meminfo"
    meminfo.write_text("MemTotal:       8000000 kB\nMemAvailable:   2000000 kB\nSwapTotal: ...\n")
    monkeypatch.setattr(
        "backend.services.predictor.open",
        lambda *a, **k: open(meminfo, **k),
        raising=False,
    )
    assert _mem_available_mb() == 1953


def test_guard_raises_when_memory_too_low(monkeypatch):
    monkeypatch.setattr(
        "backend.services.predictor._mem_available_mb",
        lambda: 400,
    )
    monkeypatch.delenv("MINDGUARD_SKIP_MEM_CHECK", raising=False)
    with pytest.raises(RuntimeError, match="free tier"):
        _ensure_memory_headroom()


def test_guard_passes_when_memory_adequate(monkeypatch):
    monkeypatch.setattr(
        "backend.services.predictor._mem_available_mb",
        lambda: 8192,
    )
    monkeypatch.delenv("MINDGUARD_SKIP_MEM_CHECK", raising=False)
    _ensure_memory_headroom()


def test_guard_skippable(monkeypatch):
    monkeypatch.setattr(
        "backend.services.predictor._mem_available_mb",
        lambda: 400,
    )
    monkeypatch.setenv("MINDGUARD_SKIP_MEM_CHECK", "true")
    _ensure_memory_headroom()
