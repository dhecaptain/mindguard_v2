"""Send a one-off test email through the app's configured provider.

Exercises the exact production path (Resend preferred, SMTP fallback) used by
consent and demo-request emails, so it is the go/no-go check after configuring
email delivery.

Usage:
    PYTHONPATH=..:. python3 scripts/test_email.py you@example.com [subject]

Exit code 0 on delivery, 1 otherwise.
"""

import sys

from backend.services.email_sender import get_email_from, send_html_email

SUBJECT = "MindGuard email delivery test"
BODY = (
    "<p>This is a test email from MindGuard.</p>"
    "<p>If you can read this, email delivery is configured correctly.</p>"
)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        return 1
    to_email = sys.argv[1]
    subject = sys.argv[2] if len(sys.argv) > 2 else SUBJECT

    ok, err = send_html_email(to_email, subject, BODY)
    if ok:
        print(f"[test-email] sent via {get_email_from()} -> {to_email}")
        return 0
    print(f"[test-email] FAILED: {err}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
