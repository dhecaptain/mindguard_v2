import time
import numpy as np
import torch

from backend.models.loader import load_model


def predict_one(text: str):
    model, tokenizer, config, device = load_model()
    max_length = config.get("max_length", 256)
    enc = tokenizer(
        text, max_length=max_length,
        padding="max_length", truncation=True, return_tensors="pt",
    )
    t0 = time.time()
    with torch.no_grad():
        out = model(
            input_ids=enc["input_ids"].to(device),
            attention_mask=enc["attention_mask"].to(device),
        )
        probs = torch.softmax(out.logits, dim=1)
        prob = probs[0][1].item()
    ms = (time.time() - t0) * 1000
    return prob, ms


def predict_batch(texts: list) -> np.ndarray:
    if not texts:
        return np.array([])
    model, tokenizer, config, device = load_model()
    max_length = config.get("max_length", 256)
    all_probs = []
    batch_size = 16
    model.eval()
    for i in range(0, len(texts), batch_size):
        batch = texts[i: i + batch_size]
        enc = tokenizer(
            batch, max_length=max_length,
            padding="max_length", truncation=True, return_tensors="pt",
        )
        with torch.no_grad():
            out = model(
                input_ids=enc["input_ids"].to(device),
                attention_mask=enc["attention_mask"].to(device),
            )
            probs = torch.softmax(out.logits, dim=1)
            all_probs.extend(probs[:, 1].cpu().numpy())
    return np.array(all_probs)
