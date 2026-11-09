
"""FastAPI application and privacy-safe error handlers."""

from uuid import UUID

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.api.routes.diphtheria import router as investigation_router
from app.validation.diphtheria import SubmissionValidationError


app = FastAPI(
    title="Diphtheria CIF API",
    description="NDSS Diphtheria Case Investigation Form backend.",
    version="0.5.0",
)

app.include_router(investigation_router)


@app.get("/health", tags=["System"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def request_validation_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Strip input values and patient data from FastAPI's default 422 response."""
    errors: dict[str, str] = {}

    for issue in exc.errors():
        location = list(issue.get("loc", ()))

        if location and location[0] == "body":
            location.pop(0)

        field = "form"

        if location:
            section = location[0]
            field = str(section)

            if len(location) > 1:
                field = f"{section}-{location[1]}"

                if section == "treatment" and location[1] == "antibioticRows":
                    field = "treatment-antibioticRows"

                    if len(location) >= 4 and isinstance(location[2], int):
                        # Use only a validated UUID from the row,
                        # never raw patient data.
                        body = exc.body
                        rows = (
                            body.get("treatment", {}).get("antibioticRows", [])
                            if isinstance(body, dict)
                            and isinstance(body.get("treatment"), dict)
                            else []
                        )

                        if isinstance(rows, list) and 0 <= location[2] < len(rows):
                            row = rows[location[2]]

                            if isinstance(row, dict) and isinstance(row.get("id"), str):
                                try:
                                    row_id = str(UUID(row["id"]))
                                    field = f"treatment-{row_id}-{location[3]}"
                                except ValueError:
                                    pass

        errors.setdefault(field, "Invalid or missing field value.")

    return JSONResponse(
        status_code=422,
        content={"errors": errors},
    )


@app.exception_handler(SubmissionValidationError)
async def submission_validation_handler(
    request: Request,
    exc: SubmissionValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"errors": exc.errors},
    )


@app.exception_handler(IntegrityError)
async def constraint_error_handler(
    request: Request,
    exc: IntegrityError,
) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={
            "detail": "Investigation conflicts with a database constraint."
        },
    )


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(
    request: Request,
    exc: SQLAlchemyError,
) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"detail": "Database operation unavailable."},
    )
