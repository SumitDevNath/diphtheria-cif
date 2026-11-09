
"""Minimal protected core investigation endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import (
    get_trusted_submission_context,
    require_ndss_access,
)
from app.db.session import get_db
from app.schemas.diphtheria import DiphtheriaSubmitRequest
from app.schemas.investigation import InvestigationResponse
from app.services.diphtheria import (
    InvestigationNotFound,
    InvestigationVersionConflict,
    create_investigation,
    etag_for,
    replace_investigation,
    retrieve_investigation,
    to_response,
)
from app.validation.diphtheria import SubmissionContext


router = APIRouter(
    prefix="/api/v1/diphtheria/investigations",
    tags=["Diphtheria investigations"],
    dependencies=[Depends(require_ndss_access)],
)


@router.post(
    "",
    response_model=InvestigationResponse,
    status_code=201,
)
async def create(
    payload: DiphtheriaSubmitRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
    context: SubmissionContext = Depends(get_trusted_submission_context),
) -> InvestigationResponse:
    record = await create_investigation(session, payload, context)

    response.headers["ETag"] = etag_for(record)
    response.headers["Location"] = (
        f"/api/v1/diphtheria/investigations/{record.id}"
    )

    return to_response(record)


@router.get(
    "/{investigation_id}",
    response_model=InvestigationResponse,
)
async def retrieve(
    investigation_id: UUID,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> InvestigationResponse:
    try:
        record = await retrieve_investigation(
            session,
            investigation_id,
        )
    except InvestigationNotFound as exc:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found.",
        ) from exc

    response.headers["ETag"] = etag_for(record)
    return to_response(record)


@router.put(
    "/{investigation_id}",
    response_model=InvestigationResponse,
)
async def replace(
    investigation_id: UUID,
    payload: DiphtheriaSubmitRequest,
    response: Response,
    if_match: str | None = Header(default=None, alias="If-Match"),
    session: AsyncSession = Depends(get_db),
    context: SubmissionContext = Depends(get_trusted_submission_context),
) -> InvestigationResponse:
    if if_match is None:
        raise HTTPException(
            status_code=status.HTTP_428_PRECONDITION_REQUIRED,
            detail="If-Match header is required.",
        )

    try:
        record = await replace_investigation(
            session,
            investigation_id,
            payload,
            context,
            if_match,
        )
    except InvestigationNotFound as exc:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found.",
        ) from exc
    except InvestigationVersionConflict as exc:
        raise HTTPException(
            status_code=412,
            detail="Investigation has changed; reload before saving.",
        ) from exc

    response.headers["ETag"] = etag_for(record)
    return to_response(record)
