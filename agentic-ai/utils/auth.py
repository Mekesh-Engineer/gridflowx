"""
GridFlowX FastAPI Server-Side Authentication — Supabase Auth
============================================================
Verifies Supabase JWT tokens, decodes user metadata claims,
and enforces role-based access control on API endpoints.
Replaces the former Firebase Admin-based token verification.
"""

import os
from typing import Optional
from pydantic import BaseModel
from fastapi import Header, Query, HTTPException, status, Depends


class AuthUser(BaseModel):
    uid: str
    email: Optional[str] = None
    role: str = "operator"  # 'admin' | 'supervisor' | 'operator' | 'auditor' | 'user'
    tenantId: Optional[str] = None


# Role hierarchy weights for permission enforcement
ROLE_HIERARCHY = {
    "user": 1,
    "auditor": 2,
    "operator": 3,
    "supervisor": 4,
    "admin": 5,
}


def _verify_supabase_token(raw_token: str) -> AuthUser:
    """
    Verifies a Supabase JWT bearer token using the Supabase admin client.
    Falls back to dev-mode role-tagged tokens when DEV_BYPASS_AUTH=true.
    """
    clean_token = raw_token.strip()
    if clean_token.startswith("Bearer "):
        clean_token = clean_token[7:].strip()

    dev_bypass = os.getenv("DEV_BYPASS_AUTH", "true").lower() in ("true", "1", "yes")

    # Development bypass: role-tagged tokens (e.g. "dev-admin", "dev-supervisor")
    if dev_bypass and clean_token.startswith("dev-"):
        role_part = clean_token.split("-", 1)[1].lower()
        role = role_part if role_part in ROLE_HIERARCHY else "operator"
        return AuthUser(uid=f"dev-user-{role}", email=f"{role}@gridflowx.io", role=role)

    if dev_bypass and clean_token in ("dev-token", "valid-token", "testing-token", ""):
        return AuthUser(uid="dev-operator-01", email="operator@gridflowx.io", role="operator")

    # Production: verify via Supabase Admin
    try:
        from backend.database.supabase_client import supabase_admin

        resp = supabase_admin.auth.get_user(clean_token)
        if resp and resp.user:
            user = resp.user
            metadata = user.user_metadata or {}
            role = metadata.get("role", "operator")
            return AuthUser(
                uid=user.id,
                email=user.email,
                role=role,
                tenantId=metadata.get("tenantId"),
            )
    except Exception as err:
        if dev_bypass:
            return AuthUser(uid="fallback-dev-supervisor", email="dev@gridflowx.io", role="supervisor")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Supabase token: {str(err)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Token present but not verified
    if dev_bypass:
        return AuthUser(uid="fallback-dev-operator", email="dev@gridflowx.io", role="operator")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
) -> AuthUser:
    """Extracts user if token present, else returns public role."""
    auth_header = authorization or token
    if not auth_header:
        return AuthUser(uid="public-visitor", email=None, role="public")
    try:
        return _verify_supabase_token(auth_header)
    except Exception:
        return AuthUser(uid="public-visitor", email=None, role="public")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
) -> AuthUser:
    """Extracts and authenticates the current user from the bearer token."""
    auth_header = authorization or token
    if not auth_header:
        dev_bypass = os.getenv("DEV_BYPASS_AUTH", "true").lower() in ("true", "1", "yes")
        if dev_bypass:
            return AuthUser(uid="default-dev-operator", email="operator@gridflowx.io", role="operator")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header or token query parameter",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _verify_supabase_token(auth_header)


async def require_operator_or_above(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Requires operator, supervisor, or admin role."""
    if ROLE_HIERARCHY.get(user.role.lower(), 0) < ROLE_HIERARCHY["operator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Action requires 'operator' or higher role (current: '{user.role}')",
        )
    return user


async def require_supervisor_or_above(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Requires supervisor or admin role."""
    if ROLE_HIERARCHY.get(user.role.lower(), 0) < ROLE_HIERARCHY["supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Action requires 'supervisor' or higher role (current: '{user.role}')",
        )
    return user


async def require_admin_only(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Requires admin role."""
    if ROLE_HIERARCHY.get(user.role.lower(), 0) < ROLE_HIERARCHY["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Action requires 'admin' role (current: '{user.role}')",
        )
    return user
