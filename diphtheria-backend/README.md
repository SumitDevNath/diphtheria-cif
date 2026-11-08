# Diphtheria CIF Backend

Phase 1 FastAPI foundation for the NDSS Diphtheria Case Investigation Form.

## Requirements

- Python 3.11 or later
- Windows Git Bash (for the commands below)

## Setup

```bash
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
python -m pip check
```

## Run locally

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- Liveness: http://127.0.0.1:8000/health
- OpenAPI UI: http://127.0.0.1:8000/docs
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json

The liveness route reports application-process availability only; it does not check PostgreSQL.

## Implementation status

No database models, migrations, investigation endpoints, authentication, or frontend integration are implemented in Phase 1. Patient investigation data cannot be submitted or persisted yet.
