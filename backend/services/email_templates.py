"""Email template builders for the consent + demo workflows (Brief §4).

Every email uses the product's visual language: white background, teal
accents (#0F766E), Inter font. Templates are plain Python string builders —
no external templating dependency — and produce render-friendly inline-styled
HTML that works in Gmail, Outlook (web + desktop), and iOS Mail.

Theming reference (matches frontend/src/index.css tokens):
  teal:      #0F766E
  teal-deep: #115E59
  ink:       #0F172A
  slate:     #64748B
"""

import html

_TEAL = "#0F766E"
_INK = "#0F172A"
_SLATE = "#64748B"
_BG = "#FFFFFF"

# Withdraw / privacy links are appended to every consent email footer.
_FOOTER = (
    '<a href="{withdraw_url}" style="color:#0F766E;text-decoration:underline;font-size:12px;margin-right:16px;">'
    "Withdraw consent</a>"
    '<a href="{privacy_url}" style="color:#0F766E;text-decoration:underline;font-size:12px;margin-right:16px;">'
    "Privacy policy</a>"
    '<a href="{contact_url}" style="color:#0F766E;text-decoration:underline;font-size:12px;">Contact</a>'
)


def _esc(value) -> str:
    return html.escape(str(value), quote=True)


def _layout(subject_body: str, footer: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F0FDFA;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0FDFA;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:{_BG};border-radius:8px;overflow:hidden;border:1px solid #E2E8F0;">
<tr><td style="background-color:{_TEAL};padding:20px 28px;">
<span style="font-family:Inter,Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:{_BG};letter-spacing:0.5px;">MindGuard</span>
</td></tr>
<tr><td style="padding:28px 28px 20px;">
{subject_body}
</td></tr>
<tr><td style="padding:12px 28px 24px;border-top:1px solid #E2E8F0;background-color:#F8FAFC;">
<p style="margin:0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:12px;color:{_SLATE};line-height:1.6;">
{footer or "&nbsp;"}
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>"""


def _button(url: str, label: str) -> str:
    return (
        f'<a href="{_esc(url)}" style="display:inline-block;background-color:{_TEAL};'
        f'color:{_BG};font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;'
        f'text-decoration:none;padding:12px 28px;border-radius:6px;">{_esc(label)}</a>'
    )


def _p(text: str, size: int = 15) -> str:
    return (
        f'<p style="margin:0 0 14px;font-family:Inter,Arial,Helvetica,sans-serif;'
        f'font-size:{size}px;color:{_INK};line-height:1.65;">{text}</p>'
    )


def _li(text: str) -> str:
    return (
        f'<li style="margin:0 0 8px;font-family:Inter,Arial,Helvetica,sans-serif;'
        f'font-size:15px;color:{_INK};line-height:1.6;">{text}</li>'
    )


def _heading(text: str) -> str:
    return (
        f'<p style="margin:0 0 16px;font-family:Inter,Arial,Helvetica,sans-serif;'
        f'font-size:18px;font-weight:600;color:{_INK};">{_esc(text)}</p>'
    )


# ── Consent templates (Brief §4.1–4.6) ───────────────────────────────

def student_consent_request(context: dict) -> tuple[str, str]:
    """4.1 Student Consent Request (Adult). Returns (subject, html)."""
    institution = _esc(context["institution_name"])
    first = _esc(context["student_first_name"])
    subject = f"Your consent is needed for MindGuard at {institution}"
    body = (
        _p(f"Hi {first},")
        + _p(
            f"{institution} is using MindGuard, a decision-support tool that helps counsellors "
            "identify early signs of mental distress in consented digital content. Your counsellor "
            "would like your permission to include your opted-in content in this process."
        )
        + _p("Before you decide, please review what this means:")
        + '<ul style="margin:0 0 16px;padding-left:20px;">'
        + _li("Only content you explicitly share will be analysed")
        + _li("Your data is never sold or shared outside your school")
        + _li("You can withdraw your consent at any time")
        + _li("MindGuard supports counsellors — it does not replace them")
        + "</ul>"
        + '<p style="margin:0 0 20px;">' + _button(context["consent_url"], "Review and respond") + "</p>"
        + _p(f'This link expires in 30 days. If you have questions, contact your counsellor at {_esc(context["counsellor_email"])}.')
        + _p(f"— The MindGuard Team at {institution}", size=13)
    )
    footer = _FOOTER.format(**context)
    return subject, _layout(body, footer)


def parent_consent_request(context: dict) -> tuple[str, str]:
    """4.2 Parent Consent Request (for Minors). Returns (subject, html)."""
    institution = _esc(context["institution_name"])
    parent = _esc(context["parent_first_name"])
    student = _esc(context["student_first_name"])
    subject = f"Parental consent requested for {student} at {institution}"
    body = (
        _p(f"Dear {parent},")
        + _p(
            f"{institution} is inviting {student} to participate in MindGuard, a consent-first tool "
            "that helps school counsellors identify early signs of mental distress in students' "
            "opted-in digital content."
        )
        + _p(f"Because {student} is under 18, your consent is required before they can participate.")
        + _p("What MindGuard does:")
        + '<ul style="margin:0 0 16px;padding-left:20px;">'
        + _li(f"Analyses only content that {student} explicitly shares")
        + _li("Produces summaries that a trained counsellor reviews")
        + _li("Does not diagnose, monitor, or replace human care")
        + _li("Never sells or shares your child's data outside the school")
        + "</ul>"
        + _p("You can:")
        + '<ul style="margin:0 0 16px;padding-left:20px;">'
        + _li(f"<strong>Accept</strong> — {student} can participate under counsellor supervision")
        + _li(f"<strong>Decline</strong> — {student} will not be included")
        + _li("<strong>Withdraw later</strong> — at any time, one click, no questions asked")
        + "</ul>"
        + '<p style="margin:0 0 20px;">' + _button(context["consent_url"], "Review and respond") + "</p>"
        + _p(
            f'This link is valid for 30 days. For questions, contact {_esc(context["counsellor_email"])} '
            "or your school's data privacy officer."
        )
        + _p(f"— The MindGuard Team at {institution}", size=13)
    )
    footer = _FOOTER.format(**context)
    return subject, _layout(body, footer)


def student_courtesy_copy(context: dict) -> tuple[str, str]:
    """4.3 Student Courtesy Copy (Minor Case). Informational, no consent action."""
    institution = _esc(context["institution_name"])
    student = _esc(context["student_first_name"])
    subject = f"MindGuard at {institution} — for your information"
    body = (
        _p(f"Hi {student},")
        + _p(
            f"Your school, {institution}, is using MindGuard to support students. Because you are "
            "under 18, we have contacted your parent or guardian to ask for their permission before "
            "any of your content could be included."
        )
        + _p(
            'You do not need to do anything right now. You can learn more about what MindGuard does '
            f'<a href="{_esc(context["privacy_url"])}" style="color:{_TEAL};text-decoration:underline;">here</a>.'
        )
        + _p(f"— The MindGuard Team at {institution}", size=13)
    )
    footer = _FOOTER.format(**context)
    return subject, _layout(body, footer)


def consent_reminder(context: dict, day: int) -> tuple[str, str]:
    """4.4 Reminder (day 3 / day 7). Shortened original with a clear CTA."""
    institution = _esc(context["institution_name"])
    first = _esc(context["student_first_name"])
    if day >= 7:
        subject = "Last few days to respond — MindGuard consent"
    else:
        subject = "A gentle reminder — your consent for MindGuard"
    body = (
        _p(f"Hi {first},")
        + _p(
            f"We're just following up on your MindGuard consent request from {institution}. "
            "This is a short reminder so you don't lose your link."
        )
        + _p("Your response takes a minute and you can change your mind at any time.")
        + '<p style="margin:0 0 20px;">' + _button(context["consent_url"], "Review and respond") + "</p>"
        + _p(f"— The MindGuard Team at {institution}", size=13)
    )
    footer = _FOOTER.format(**context)
    return subject, _layout(body, footer)


def consent_confirmation(context: dict, accepted: bool) -> tuple[str, str]:
    """4.5 Confirmation (after Accept or Decline)."""
    student = _esc(context["student_first_name"])
    if accepted:
        subject = "Thank you — your consent is recorded"
        headline = "Thank you — your consent is recorded."
    else:
        subject = "Thank you for your response"
        headline = f"Thank you for your response — {student} will not be included."
    body = _heading(headline) + _p(
        "If you change your mind, you can update your decision using the link below at any time."
    ) + '<p style="margin:0 0 20px;">' + _button(context["consent_url"], "Update decision") + "</p>"
    footer = _FOOTER.format(**context)
    return subject, _layout(body, footer)


def admin_consent_notification(context: dict) -> tuple[str, str]:
    """4.6 Admin Notification — who responded, status, link to tracker row."""
    student = _esc(context["student_first_name"])
    status = _esc(context["status"])
    subject = f"Consent update — {student} responded"
    body = (
        _p(f"{student} responded to their consent request with status <strong>{status}</strong>.")
        + '<p style="margin:0 0 20px;">'
        + _button(context["tracker_url"], "View in tracker")
        + "</p>"
    )
    footer = _FOOTER.format(**context)
    return subject, _layout(body, footer)


# ── Demo pipeline templates (Brief §4.7–4.8) ─────────────────────────

def demo_request_confirmation(context: dict) -> tuple[str, str]:
    """4.7 Demo Request Confirmation (to requester)."""
    name = _esc(context["full_name"])
    subject = "Thanks for your interest in MindGuard"
    body = (
        _p(f"Hi {name},")
        + _p(
            "Thanks for getting in touch with MindGuard. Someone from our team will reach out to you "
            "within 2 business days."
        )
        + _p(
            f'In the meantime, you can explore our <a href="{_esc(context["docs_url"])}" '
            f'style="color:{_TEAL};text-decoration:underline;">documentation</a> '
            "and a short intro video."
        )
        + _p("— The MindGuard Team", size=13)
    )
    footer = _FOOTER.format(**context)
    return subject, _layout(body, footer)


def demo_request_notification(context: dict) -> tuple[str, str]:
    """4.8 Demo Request Notification (to Diana / pipeline owner)."""
    org = _esc(context["organisation"])
    org_type = _esc(context["organisation_type"])
    subject = f"New demo request — {org} ({org_type})"
    fields = {
        "Full name": context.get("full_name", ""),
        "Work email": context.get("work_email", ""),
        "Organisation": context.get("organisation", ""),
        "Organisation type": context.get("organisation_type", ""),
        "Role / title": context.get("role_title", ""),
        "Country": context.get("country", ""),
        "Student population": context.get("student_count_range", ""),
        "Heard about us": context.get("heard_about_us", ""),
        "Message": context.get("message", ""),
    }
    rows = "".join(
        f'<tr><td style="padding:6px 10px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:14px;color:{_SLATE};'
        f'width:160px;vertical-align:top;">{_esc(k)}</td>'
        f'<td style="padding:6px 10px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:14px;color:{_INK};">'
        f'{_esc(v) if v else "—"}</td></tr>'
        for k, v in fields.items() if k != "Message"
    )
    message = _esc(context.get("message", ""))
    body = (
        _p("A new demo request was submitted.")
        + '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-collapse:collapse;">'
        + rows
        + "</table>"
        + (f'<p style="margin:0 0 16px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:15px;color:{_INK};">Message: {message}</p>' if message else "")
        + '<p style="margin:0 0 20px;">' + _button(context["admin_url"], "View in admin panel") + "</p>"
    )
    footer = _FOOTER.format(**context)
    return subject, _layout(body, footer)
