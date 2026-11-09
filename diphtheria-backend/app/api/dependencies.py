
"""NDSS integration gates. Deny patient-data access until identity is integrated."""

from typing import NoReturn

from fastapi import HTTPException, status

from app.validation.diphtheria import SubmissionContext


def require_ndss_access() -> NoReturn:
    """Replace only after NDSS identity + record authorization are confirmed."""
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="NDSS record access integration is not configured.",
    )


def get_trusted_submission_context() -> SubmissionContext:
    """Replace with trusted shared demographics and Travel History validation."""
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="NDSS submission validation integration is not configured.",
    )
