"""Tests for the RBAC permission layer (Delivery Brief §5)."""

import pytest
from fastapi import HTTPException

from backend import permissions as perm


def _user(role: str, permissions_json: str | None = None) -> dict:
    return {"role_type": role, "permissions_json": permissions_json}


def test_normalize_role_aliases():
    assert perm.normalize_role("counselor") == "counsellor"
    assert perm.normalize_role("Counsellor") == "counsellor"
    assert perm.normalize_role("ADMIN") == "admin"
    assert perm.normalize_role("someone-else") == "student"
    assert perm.normalize_role(None) == "student"


def test_role_defaults():
    assert perm.role_permissions("student") == {perm.PERM_CONSENT_RESPOND}
    assert perm.PERM_ANALYSIS_RUN in perm.role_permissions("counsellor")
    assert perm.PERM_ANALYSIS_RUN in perm.role_permissions("admin")
    assert perm.PERM_ROSTER_UPLOAD in perm.role_permissions("admin")
    assert perm.PERM_ROSTER_UPLOAD not in perm.role_permissions("counsellor")


def test_school_admin_role_defaults():
    """School Admin = counsellor duties + roster/bulk-consent workflow (Brief §1.1)."""
    perms = perm.role_permissions("school_admin")
    assert perm.PERM_ANALYSIS_RUN in perms
    assert perm.PERM_STUDENTS_VIEW in perms
    assert perm.PERM_CONSENT_MANAGE in perms
    assert perm.PERM_ROSTER_UPLOAD in perms
    # School admin is not an admin: no demo pipeline / full audit access by default.
    assert perm.PERM_DEMO_MANAGE not in perms
    assert perm.PERM_AUDIT_VIEW not in perms


def test_school_admin_can_upload_roster_and_dispatch():
    u = _user("school_admin")
    perm.require_permission(u, perm.PERM_ROSTER_UPLOAD)
    perm.require_permission(u, perm.PERM_CONSENT_MANAGE)
    assert perm.has_permission(u, perm.PERM_ANALYSIS_RUN)
    with pytest.raises(HTTPException):
        perm.require_permission(u, perm.PERM_DEMO_MANAGE)


def test_student_cannot_analyse():
    assert not perm.has_permission(_user("student"), perm.PERM_ANALYSIS_RUN)
    with pytest.raises(HTTPException) as exc:
        perm.require_permission(_user("student"), perm.PERM_ANALYSIS_RUN)
    assert exc.value.status_code == 403


def test_counsellor_can_analyse_but_not_roster():
    u = _user("counsellor")
    perm.require_permission(u, perm.PERM_ANALYSIS_RUN)
    assert not perm.has_permission(u, perm.PERM_ROSTER_UPLOAD)


def test_admin_has_everything():
    u = _user("admin")
    for p in perm.ALL_PERMISSIONS:
        assert perm.has_permission(u, p), p


def test_permissions_json_list_is_additive():
    u = _user("counsellor", permissions_json='["roster.upload", "students.view"]')
    assert perm.has_permission(u, perm.PERM_ROSTER_UPLOAD)
    assert perm.has_permission(u, perm.PERM_ANALYSIS_RUN)
    assert not perm.has_permission(u, perm.PERM_DEMO_MANAGE)


def test_permissions_json_dict_form():
    u = _user("counsellor", permissions_json='{"permissions": ["demo.manage"]}')
    assert perm.has_permission(u, perm.PERM_DEMO_MANAGE)


def test_permissions_json_ignores_unknown_and_bad_json():
    assert perm.parse_extra_permissions('["not.a.permission"]') == set()
    assert perm.parse_extra_permissions("{not json") == set()
    assert perm.parse_extra_permissions(None) == set()
    assert perm.parse_extra_permissions('42') == set()


def test_require_any_permission():
    u = _user("counsellor")
    perm.require_any_permission(u, [perm.PERM_ROSTER_UPLOAD, perm.PERM_ANALYSIS_RUN])
    with pytest.raises(HTTPException):
        perm.require_any_permission(u, [perm.PERM_ROSTER_UPLOAD, perm.PERM_DEMO_MANAGE])
