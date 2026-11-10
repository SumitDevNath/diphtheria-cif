"""FastAPI app: secure defaults, investigation routes, and safe errors."""

from uuid import UUID

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.api.routes.diphtheria import router as investigation_router
from app.core.config import SecuritySettings, get_security_settings
from app.core.security import (
    RequestBodyLimitMiddleware,
    SecurityHeadersMiddleware,
)
from app.validation.diphtheria import SubmissionValidationError


def create_app(
    settings: SecuritySettings | None = None,
) -> FastAPI:
    security = (
        settings if settings is not None
        else get_security_settings()
    )

    app = FastAPI(
        title="Diphtheria CIF API",
        description="NDSS Diphtheria Case Investigation Form backend.",
        version="0.6.0",
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
        errors: dict[str, str] = {}

        for issue in exc.errors():
            location = list(issue.get("loc", ()))

            if location and location[0] == "body":
                location.pop(0)

            field = "form"

            if location:
                section = str(location[0])
                field = section

                if len(location) > 1:
                    field = f"{section}-{location[1]}"

                    if (
                        section == "treatment"
                        and location[1] == "antibioticRows"
                    ):
                        field = "treatment-antibioticRows"

                        if (
                            len(location) >= 4
                            and isinstance(location[2], int)
                        ):
                            body = exc.body

                            rows = (
                                body.get(
                                    "treatment", {}
                                ).get("antibioticRows", [])
                                if isinstance(body, dict)
                                and isinstance(
                                    body.get("treatment"), dict
                                )
                                else []
                            )

                            if (
                                isinstance(rows, list)
                                and 0 <= location[2] < len(rows)
                            ):
                                row = rows[location[2]]

                                if (
                                    isinstance(row, dict)
                                    and isinstance(
                                        row.get("id"), str
                                    )
                                ):
                                    try:
                                        row_id = str(UUID(row["id"]))
                                        field = (
                                            f"treatment-{row_id}-"
                                            f"{location[3]}"
                                        )
                                    except ValueError:
                                        pass

            errors.setdefault(
                field,
                "Invalid or missing field value.",
            )

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
                "detail": (
                    "Investigation conflicts with a "
                    "database constraint."
                )
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_error_handler(
        request: Request,
        exc: SQLAlchemyError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=503,
            content={
                "detail": "Database operation unavailable."
            },
        )

    app.add_middleware(
        RequestBodyLimitMiddleware,
        max_body_bytes=security.max_request_body_bytes,
    )

    app.add_middleware(SecurityHeadersMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=security.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "If-Match",
        ],
        expose_headers=["ETag", "Location"],
    )

    return app


app = create_app()
