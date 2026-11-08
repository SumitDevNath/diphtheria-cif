
"""FastAPI application entry point for the Diphtheria CIF backend."""

from fastapi import FastAPI

app = FastAPI(
    title="Diphtheria CIF API",
    description="Backend foundation for NDSS Diphtheria Case Investigation Form.",
    version="0.1.0",
)


@app.get("/health", tags=["System"])
def health() -> dict[str, str]:
    """Report process liveness; database connectivity is not checked."""
    return {"status": "ok"}
