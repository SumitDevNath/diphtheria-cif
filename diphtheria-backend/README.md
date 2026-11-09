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

# Diphtheria CIF Backend

Phase 2: PostgreSQL connection and Alembic foundation. The application remains part of the existing frontend repository.

## Requirements

- Python 3.11+ and Git Bash on Windows
- An already installed and running local PostgreSQL server
- A dedicated, empty development database and a database login with access to it

## Setup

Run inside `diphtheria-backend/`:

```bash
source .venv/Scripts/activate
python -m pip install -r requirements.txt
python -m pip check
cp .env.example .env
```

Fill in `.env` using the actual database host, port, name, username and password. The `.env` file is Git-ignored.

## Verify connectivity (read-only)

```bash
python -m pytest -q tests/test_database_config.py
python -m pytest -q tests/test_database_connection.py
python -m alembic current --verbose
python -m alembic heads
```

No Alembic revision exists yet; an empty `heads` result is normal in Phase 2. ORM entities and the first revision are added in Phase 3.

## Start the API

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- Process liveness: http://127.0.0.1:8000/health
- API documentation: http://127.0.0.1:8000/docs

`/health` does not check PostgreSQL. No patient data, investigation endpoints, models, authentication, or schema migrations are implemented yet.
