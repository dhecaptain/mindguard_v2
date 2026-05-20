"""
email_helper.py — MindGuard SMTP Email Sender
Reads config from environment variables. Never crashes if SMTP is not configured.
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

_SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
_SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))


def is_smtp_configured() -> bool:
    """Return True if SMTP_USER and SMTP_PASSWORD are set."""
    return bool(os.environ.get("SMTP_USER")) and bool(os.environ.get("SMTP_PASSWORD"))


def send_email(to_email: str, subject: str, body_html: str) -> tuple:
    """
    Send an HTML email via SMTP.
    Returns (success: bool, error_msg: str).
    """
    if not is_smtp_configured():
        return False, "SMTP not configured"

    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = to_email
        msg.attach(MIMEText(body_html, "html", "utf-8"))

        with smtplib.SMTP(_SMTP_HOST, _SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())

        return True, ""
    except Exception as e:
        return False, str(e)


def send_parent_notification(
    parent_email: str,
    student_name: str,
    student_email: str,
) -> tuple:
    """
    Send an HTML notification email to a parent/guardian about their under-18
    child registering on MindGuard.
    Returns (success: bool, error_msg: str).
    """
    subject = "MindGuard — Your child has registered for a school mental health tool"

    body_html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#064b3b;border-radius:8px 8px 0 0;padding:24px 28px">
    <h1 style="color:#ffffff;margin:0;font-size:1.4rem">MindGuard</h1>
    <p style="color:#a7d8cb;margin:4px 0 0;font-size:0.85rem">School Mental Health Screening Platform</p>
  </div>
  <div style="background:#ffffff;border:1px solid #d9e3df;border-top:none;border-radius:0 0 8px 8px;padding:28px">
    <h2 style="color:#111827;font-size:1.1rem;margin-top:0">Parent/Guardian Notification</h2>
    <p>Dear Parent or Guardian,</p>
    <p>This is an automated notification to let you know that a student account has been created on
    <strong>MindGuard</strong>, a consent-first mental health screening tool used by schools to help
    identify early signals of distress and connect students with support.</p>
    <table style="border:1px solid #d9e3df;border-radius:8px;width:100%;border-collapse:collapse;margin:16px 0">
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #d9e3df;font-weight:600;width:40%">Student Name</td>
        <td style="padding:10px 14px;border-bottom:1px solid #d9e3df">{student_name}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:600">Student Email</td>
        <td style="padding:10px 14px">{student_email}</td>
      </tr>
    </table>
    <p>MindGuard is a research-grade tool operated under ethics approval. Data is never shared with
    third parties and is used solely for student wellbeing.</p>
    <p>If you have any questions or wish to withdraw your child's consent, please contact your school
    counsellor or mental health coordinator.</p>
    <hr style="border:none;border-top:1px solid #d9e3df;margin:20px 0">
    <p style="font-size:0.78rem;color:#6b7280">
      This email was sent automatically because an under-18 student registered with your email as
      parent/guardian. If you did not expect this, please contact your school administrator.
    </p>
  </div>
</body>
</html>
"""

    return send_email(parent_email, subject, body_html)
