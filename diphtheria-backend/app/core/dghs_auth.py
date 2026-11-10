
"""Validate Bearer credentials using the confirmed DGHS GET endpoint."""

import httpx
from fastapi import HTTPException, status
from pydantic import (
    BaseModel,
    ConfigDict,
    ValidationError,
    field_validator,
)


class FacilityPrincipal(BaseModel):
    """Trusted identity fields needed for facility-scoped authorization."""

    model_config = ConfigDict(
        strict=True,
        extra="ignore",
    )

    id: int
    role: str
    facility_id: str
    is_active: bool
    status: str

    @field_validator("facility_id", mode="before")
    @classmethod
    def facility_identifier(cls, value: object) -> str:
        if (
            isinstance(value, bool)
            or not isinstance(value, (str, int))
        ):
            raise ValueError("Invalid facility ID")

        facility_id = str(value).strip()

        if not facility_id:
            raise ValueError("Missing facility ID")

        return facility_id


def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def validate_dghs_token(
    token: str,
    url: str,
    client: httpx.AsyncClient,
) -> FacilityPrincipal:
    """Validate token with DGHS without logging credentials or responses."""

    if (
        not token
        or len(token) > 8192
        or not token.isascii()
        or any(char.isspace() for char in token)
    ):
        raise unauthorized()

    try:
        response = await client.get(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail="DGHS authentication service unavailable.",
        ) from exc

    if response.status_code in (401, 403):
        raise unauthorized()

    if response.status_code != 200:
        raise HTTPException(
            status_code=503,
            detail="DGHS authentication service unavailable.",
        )

    try:
        principal = FacilityPrincipal.model_validate(
            response.json()
        )
    except (ValueError, ValidationError) as exc:
        raise HTTPException(
            status_code=503,
            detail="DGHS authentication response is invalid.",
        ) from exc

    if not principal.is_active or principal.status != "active":
        raise HTTPException(
            status_code=403,
            detail="DGHS account is not active.",
        )

    if principal.role != "facility":
        raise HTTPException(
            status_code=403,
            detail="Diphtheria investigation access is not permitted.",
        )

    if principal.id <= 0:
        raise HTTPException(
            status_code=503,
            detail="DGHS authentication response is invalid.",
        )

    return principal
