
"""DGHS authentication and trusted NDSS context dependencies."""

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from app.core.config import get_security_settings
from app.core.dghs_auth import (
    FacilityPrincipal,
    unauthorized,
    validate_dghs_token,
)
from app.validation.diphtheria import SubmissionContext

bearer_scheme = HTTPBearer(auto_error=False)


async def require_ndss_access(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
) -> FacilityPrincipal:
    """Authenticate and authorize one DGHS facility user."""

    if (
        credentials is None
        or not credentials.credentials.strip()
    ):
        raise unauthorized()

    settings = get_security_settings()

    if not settings.dghs_auth_validate_url:
        raise HTTPException(
            status_code=503,
            detail="DGHS authentication integration not configured.",
        )

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(5.0, connect=3.0),
        follow_redirects=False,
        trust_env=False,
    ) as client:
        return await validate_dghs_token(
            credentials.credentials,
            settings.dghs_auth_validate_url,
            client,
        )


def get_trusted_submission_context() -> SubmissionContext:
    """Deny submission until trusted NDSS demographic data is connected."""

    raise HTTPException(
        status_code=503,
        detail=(
            "NDSS submission demographics and Travel History "
            "integration not configured."
        ),
    )
