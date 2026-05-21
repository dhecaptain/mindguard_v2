"""ML predictions via HuggingFace Inference API.

Runs the model on HF's servers instead of locally, keeping this
container well under Render's 512 MB RAM limit.
"""

import time
import httpx
import numpy as np
import logging

from backend.config import HF_TOKEN, HF_REPO_ID, BASE_MODEL

logger = logging.getLogger(__name__)

_TIMEOUT = 60.0  # HF cold-starts can take ~30 s

# Use private fine-tuned model when token is available, else the public base.
_MODEL_ID = HF_REPO_ID if HF_TOKEN else BASE_MODEL
_API_URL = f"https://api-inference.huggingface.co/models/{_MODEL_ID}"
_HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}


def _label_to_prob(result_list: list) -> float:
    """Extract P(suicidal) from one HF text-classification response item."""
    for item in result_list:
        label = item.get("label", "").lower()
        # Accept LABEL_1, suicide, suicidal, positive
        if label in ("label_1", "suicide", "suicidal", "positive", "1"):
            return float(item["score"])
    # Fallback: 1 - P(non-suicidal)
    for item in result_list:
        label = item.get("label", "").lower()
        if label in ("label_0", "non-suicide", "non_suicide", "non-suicidal", "negative", "0"):
            return 1.0 - float(item["score"])
    # Last resort: return score of first item
    return float(result_list[0]["score"]) if result_list else 0.0


def _call_api(inputs: list[str]) -> list[float]:
    """Call HF Inference API, retrying once if the model is still loading."""
    for attempt in range(3):
        try:
            resp = httpx.post(
                _API_URL,
                headers=_HEADERS,
                json={"inputs": inputs},
                timeout=_TIMEOUT,
            )
            if resp.status_code == 503:
                # Model is loading on HF side; wait and retry
                estimated = resp.json().get("estimated_time", 20)
                logger.info("HF model loading, waiting %.0fs (attempt %d)", estimated, attempt + 1)
                time.sleep(min(estimated, 30))
                continue
            resp.raise_for_status()
            data = resp.json()
            # Single input → list of dicts; batch → list of lists
            if isinstance(data[0], dict):
                data = [data]
            return [_label_to_prob(item) for item in data]
        except httpx.TimeoutException:
            logger.warning("HF API timeout (attempt %d)", attempt + 1)
            if attempt == 2:
                raise
    return [0.0] * len(inputs)


def predict_one(text: str) -> tuple[float, float]:
    t0 = time.time()
    probs = _call_api([text])
    ms = (time.time() - t0) * 1000
    return probs[0], ms


def predict_batch(texts: list) -> np.ndarray:
    if not texts:
        return np.array([])
    # HF Inference API accepts up to ~100 inputs per call; chunk to be safe
    results: list[float] = []
    for i in range(0, len(texts), 32):
        results.extend(_call_api(texts[i : i + 32]))
    return np.array(results)
