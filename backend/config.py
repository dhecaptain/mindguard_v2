import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_REPO_ID = os.getenv("HF_REPO_ID", "kopiyodiana/mindguard-mental-roberta")
HF_CACHE_DIR = os.getenv(
    "HF_CACHE_DIR",
    str(Path(__file__).resolve().parent.parent / ".cache" / "huggingface"),
)

BASE_MODEL = "roberta-base"
MAX_LENGTH = 256

MODEL_LOCAL_DIR = str(Path(__file__).resolve().parent.parent / "mindguard_model_local")
TOKENIZER_DIR = str(Path(__file__).resolve().parent.parent / "mindguard_tokenizer")

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# ── Consent, PII & email delivery (Delivery Brief §7–8) ──────────────
# AES-256-GCM key, 64 hex chars. Production MUST set this via a secret manager.
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "MindGuard <noreply@mindguard.ai>")
DEMO_NOTIFY_EMAIL = os.getenv("DEMO_NOTIFY_EMAIL", "")

# Gate analysis behind accepted, non-expired, non-revoked consent.
ENFORCE_CONSENT_ANALYSIS = os.getenv("ENFORCE_CONSENT_ANALYSIS", "true").strip().lower() == "true"

CONSENT_EXPIRY_DAYS = int(os.getenv("CONSENT_EXPIRY_DAYS", "30"))
CONSENT_REMINDER_DAYS = [int(d) for d in os.getenv("CONSENT_REMINDER_DAYS", "3,7").split(",") if d.strip().isdigit()]
