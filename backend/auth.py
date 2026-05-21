import logging
import os
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Header, HTTPException
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET environment variable is required. "
        "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# In-memory blacklist for revoked tokens (keyed by jti).
# Replace with Redis or a DB table for multi-process / persistent revocation.
_token_blacklist: set[str] = set()


def blacklist_token(jti: str) -> None:
    _token_blacklist.add(jti)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(user_id: str, role_type: str) -> str:
    payload = {
        "sub": user_id,
        "role": role_type,
        "jti": str(uuid.uuid4()),
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


async def require_auth(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")
    token = authorization[7:]
    payload = decode_token(token)
    if "sub" not in payload:
        raise HTTPException(401, "Invalid token payload")
    jti = payload.get("jti", "")
    if jti and jti in _token_blacklist:
        raise HTTPException(401, "Token has been revoked")
    try:
        from backend.database import get_user_by_id
        user = get_user_by_id(payload["sub"])
    except Exception as e:
        logger.error("Database error in require_auth: %s", e)
        raise HTTPException(503, "Service temporarily unavailable")
    if not user:
        raise HTTPException(401, "User not found")
    user["_token_jti"] = jti
    return user


async def optional_auth(authorization: str | None = Header(None)) -> dict | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await require_auth(authorization)
    except HTTPException:
        return None
