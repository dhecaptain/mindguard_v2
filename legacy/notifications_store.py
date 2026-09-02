"""
notifications_store.py — MindGuard In-App Notification System
Stores notifications in notifications.json (auto-created). No external DB required.
"""

import datetime
import json
import os
import uuid

_STORE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "notifications.json")


def load_notifications() -> list:
    """Load notifications.json or return an empty list."""
    try:
        with open(_STORE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save_notifications(notifications: list) -> None:
    """Save notifications list to notifications.json."""
    with open(_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(notifications, f, indent=2, ensure_ascii=False)


def create_notification(
    sender_email: str,
    target: str,
    subject: str,
    body: str,
) -> dict:
    """
    Create and persist a notification.
    target: "all" for broadcast, or a specific email for individual.
    Returns the created notification dict.
    """
    notification = {
        "id": str(uuid.uuid4()),
        "sender": sender_email.strip().lower(),
        "target": target.strip().lower() if target.strip().lower() != "all" else "all",
        "subject": subject.strip(),
        "body": body.strip(),
        "timestamp": datetime.datetime.now().isoformat(),
        "read_by": [],
    }
    notifications = load_notifications()
    notifications.append(notification)
    save_notifications(notifications)
    return notification


def get_unread_for_user(email: str) -> list:
    """Return notifications that the given user hasn't read yet."""
    if not email:
        return []
    email = email.strip().lower()
    notifications = load_notifications()
    unread = []
    for n in notifications:
        target = n.get("target", "")
        is_for_user = (target == "all") or (target == email)
        if is_for_user and email not in n.get("read_by", []):
            unread.append(n)
    return unread


def mark_read(notification_id: str, email: str) -> None:
    """Mark a notification as read for the given user."""
    if not email or not notification_id:
        return
    email = email.strip().lower()
    notifications = load_notifications()
    for n in notifications:
        if n.get("id") == notification_id:
            if email not in n.get("read_by", []):
                n.setdefault("read_by", []).append(email)
            break
    save_notifications(notifications)


def get_all_notifications() -> list:
    """Return all notifications (for admin view)."""
    return load_notifications()
