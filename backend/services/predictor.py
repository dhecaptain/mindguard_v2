"""ML predictions via HuggingFace Space API.

The model runs on HF's free CPU hardware; this container just
makes an HTTP request, keeping Render's 512 MB RAM limit comfortable.
"""

import asyncio
import time
import httpx
import numpy as np
import logging

logger = logging.getLogger(__name__)

# Gradio Space endpoint — replace username/space-name if the Space is renamed.
_SPACE_URL = "https://kopiyodiana-mindguard-mental-roberta.hf.space/run/predict"
_TIMEOUT = 120.0  # HF Spaces cold-start can take ~60 s after idle


async def _call_space(inputs: list[str]) -> list[float]:
    """POST a batch of texts to the Gradio Space and return probabilities."""
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        for attempt in range(3):
            try:
                resp = await client.post(_SPACE_URL, json={"data": [inputs]})
                if resp.status_code == 503:
                    # Space is waking up
                    logger.info("HF Space waking up, waiting 20 s (attempt %d)", attempt + 1)
                    await asyncio.sleep(20)
                    continue
                resp.raise_for_status()
                return resp.json()["data"][0]
            except (httpx.ConnectError, httpx.TimeoutException) as exc:
                logger.warning("Space API error attempt %d: %s", attempt + 1, exc)
                if attempt == 2:
                    raise
                await asyncio.sleep(5)
    return [0.0] * len(inputs)


async def predict_one(text: str) -> tuple[float, float]:
    t0 = time.time()
    probs = await _call_space([text])
    ms = (time.time() - t0) * 1000
    return probs[0], ms


async def predict_batch(texts: list) -> np.ndarray:
    if not texts:
        return np.array([])
    results: list[float] = []
    for i in range(0, len(texts), 32):
        results.extend(await _call_space(texts[i : i + 32]))
    return np.array(results)
