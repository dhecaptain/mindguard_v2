"""Structured JSON-line logging with per-request correlation.

The single source of truth for log formatting. Every record is emitted as one
JSON object per line so logs can be shipped to an aggregator (Sentry,
Datadog, Papertrail, ...) and correlated across services by ``request_id``.

Request-scoped fields are pushed onto a ``ContextVar`` by the request-logging
middleware (``backend/main.py``) and stamped onto every log record emitted
while handling that request via :class:`RequestContextFilter`.
"""

import json
import logging
import os
import sys
import uuid
from contextvars import ContextVar
from typing import Any

# Fields copied from the request context into every log record.
_REQUEST_FIELDS = ("request_id", "method", "path", "status_code", "duration_ms", "user_id", "ip")

_request_context: ContextVar[dict[str, Any]] = ContextVar("request_context", default={})


def generate_request_id() -> str:
    """Short, URL-safe correlation id for a single HTTP request."""
    return uuid.uuid4().hex[:12]


def set_request_context(**fields: Any) -> None:
    """Bind request-scoped fields onto the current async/thread context."""
    _request_context.set(fields)


class RequestContextFilter(logging.Filter):
    """Attach request-scoped fields to every log record in the request."""

    def filter(self, record: logging.LogRecord) -> bool:
        ctx = _request_context.get()
        for field in _REQUEST_FIELDS:
            setattr(record, field, ctx.get(field))
        return True


class StructuredFormatter(logging.Formatter):
    """Emit one JSON object per log line."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for field in _REQUEST_FIELDS:
            value = getattr(record, field, None)
            if value is not None:
                payload[field] = value
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def setup_logging(level: str | int | None = None) -> None:
    """Configure the root logger with the structured handler.

    Idempotent: existing handlers are replaced, so reloads (uvicorn --reload)
    never double-log. Level comes from ``LOG_LEVEL`` when not supplied.
    """
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO").upper()
    if isinstance(level, str):
        numeric = getattr(logging, level.upper(), None)
        if not isinstance(numeric, int):
            numeric = logging.INFO
    else:
        numeric = level

    root = logging.getLogger()
    root.setLevel(numeric)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    handler.addFilter(RequestContextFilter())

    for existing in list(root.handlers):
        root.removeHandler(existing)
    root.addHandler(handler)
