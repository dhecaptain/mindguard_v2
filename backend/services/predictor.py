"""Model predictions using the trained MindGuard weights from Hugging Face."""

import asyncio
import logging
import os
import time

import numpy as np

from backend.models.loader import load_model

logger = logging.getLogger(__name__)

# torch + the trained weights need roughly 2 GB of RAM in this configuration.
# The Railway free tier caps services at 0.5 GB, so inference there would be
# OOM-killed (taking the whole worker down). We bail out before importing torch
# when the host is clearly too small, turning a crash into a 503 with guidance.
_MIN_INFERENCE_RAM_MB = 1500


def _mem_available_mb() -> int | None:
    try:
        with open("/proc/meminfo", encoding="utf-8") as fh:
            for line in fh:
                if line.startswith("MemAvailable:"):
                    return int(line.split()[1]) // 1024
    except OSError:
        return None
    return None


def _ensure_memory_headroom() -> None:
    if os.getenv("MINDGUARD_SKIP_MEM_CHECK", "").strip().lower() == "true":
        return
    available = _mem_available_mb()
    if available is not None and available < _MIN_INFERENCE_RAM_MB:
        raise RuntimeError(
            f"Not enough free memory for inference (need >= {_MIN_INFERENCE_RAM_MB} MB, "
            f"have ~{available} MB). Give the service at least 2 GB of RAM — the "
            "Railway free tier caps at 0.5 GB and will crash the worker."
        )


def _predict_batch_sync(texts: list[str]) -> list[float]:
    # torch/transformers are imported lazily so that importing the app does not
    # pay the multi-second torch cold-start or spawn its OpenMP thread pool at
    # boot (a known source of import-time stalls and deadlock flakes).
    _ensure_memory_headroom()
    import torch

    model, tokenizer, config, device = load_model()
    max_length = int(config.get("max_length", 256))
    enc = tokenizer(
        texts,
        max_length=max_length,
        padding="max_length",
        truncation=True,
        return_tensors="pt",
    )
    enc = {key: value.to(device) for key, value in enc.items()}
    with torch.no_grad():
        outputs = model(**enc)
        probs = torch.softmax(outputs.logits, dim=1)
    return probs[:, 1].detach().cpu().tolist()


async def predict_one(text: str) -> tuple[float, float]:
    t0 = time.time()
    probs = await asyncio.to_thread(_predict_batch_sync, [text])
    ms = (time.time() - t0) * 1000
    return float(probs[0]), ms


async def predict_batch(texts: list) -> np.ndarray:
    if not texts:
        return np.array([])
    results: list[float] = []
    for i in range(0, len(texts), 16):
        results.extend(await asyncio.to_thread(_predict_batch_sync, texts[i : i + 16]))
    return np.array(results)
