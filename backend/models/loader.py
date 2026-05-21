import json
import os
import torch
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from huggingface_hub import hf_hub_download, login as hf_login

from backend.config import BASE_MODEL, HF_REPO_ID, HF_TOKEN, MAX_LENGTH, MODEL_LOCAL_DIR, TOKENIZER_DIR

_model = None
_tokenizer = None
_config = None
_device = None


def load_model():
    global _model, _tokenizer, _config, _device

    if _model is not None:
        return _model, _tokenizer, _config, _device

    if torch.cuda.is_available():
        _device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        _device = torch.device("mps")
    else:
        _device = torch.device("cpu")

    config_path = Path(__file__).resolve().parent.parent.parent / "mindguard_model_config.json"
    if config_path.exists():
        with open(config_path) as f:
            _config = json.load(f)
    else:
        _config = {"max_length": MAX_LENGTH}

    token_kwargs = {"token": HF_TOKEN} if HF_TOKEN else {}

    # Path 1: HuggingFace private repo
    if HF_REPO_ID and HF_TOKEN:
        try:
            hf_login(token=HF_TOKEN)
            weights_path = hf_hub_download(
                repo_id=HF_REPO_ID, filename="mindguard_best_weights.pt",
                token=HF_TOKEN,
            )
            try:
                _tokenizer = AutoTokenizer.from_pretrained(HF_REPO_ID, subfolder="mindguard_tokenizer", **token_kwargs)
            except Exception:
                _tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, **token_kwargs)

            model = AutoModelForSequenceClassification.from_pretrained(
                BASE_MODEL, num_labels=2, ignore_mismatched_sizes=True, **token_kwargs,
            )
            state = torch.load(weights_path, map_location=_device, weights_only=True)
            model.load_state_dict(state, strict=False)
            _model = model.to(_device)
            _model.eval()
            return _model, _tokenizer, _config, _device
        except Exception:
            pass

    # Path 2: Local files
    if os.path.isdir(TOKENIZER_DIR) and os.path.isdir(MODEL_LOCAL_DIR):
        try:
            _tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_DIR)
            _model = AutoModelForSequenceClassification.from_pretrained(
                MODEL_LOCAL_DIR, num_labels=2, ignore_mismatched_sizes=True,
            )
            _model = _model.to(_device)
            _model.eval()
            return _model, _tokenizer, _config, _device
        except Exception:
            pass

    # Path 3: Base public model
    _tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, **token_kwargs)
    _model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL, num_labels=2, ignore_mismatched_sizes=True, **token_kwargs,
    )
    _model = _model.to(_device)
    _model.eval()
    return _model, _tokenizer, _config, _device
