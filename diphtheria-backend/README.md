# Diphtheria CIF Backend

Heading 1: FastAPI foundation for the NDSS Diphtheria Case Investigation Form.

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

Heading 2: PostgreSQL connection and Alembic foundation. The application remains part of the existing frontend repository.

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

# Diphtheria CIF Backend

Heading 3 establishes async PostgreSQL sessions and a migration-managed database schema for the six existing frontend sections. The React application is unchanged.

## Requirements

- Python 3.11+ on Windows with Git Bash
- An existing PostgreSQL server with the dedicated development database from Phase 2
- A local `.env` containing DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD

## Setup

From `diphtheria-backend/`:

```bash
source .venv/Scripts/activate
python -m pip install -r requirements.txt
python -m pip check
```

Do not run `git init` inside the backend folder.

## Migration

Only use the dedicated, empty development database created during Phase 2. Before applying the migration, check the current configured database and confirm that it does not contain an existing NDSS schema. Never stamp an existing schema to bypass an error.

```bash
python -m alembic heads
python -m alembic current --verbose
python -m alembic upgrade head
python -m alembic current --verbose
```

The initial migration creates `diphtheria_investigations`, `diphtheria_antibiotic_therapies`, and Alembic's version table. Do not run `alembic downgrade` on any database containing real case data.

## Tests

```bash
python -m pytest -q tests/test_schema.py tests/test_database_config.py
python -m pytest -q tests/test_database_connection.py
python -m alembic check
```

The second test command requires a running PostgreSQL database with the migration applied. `alembic check` compares models with the database; it may show differences if the database was altered manually.

## API

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Only `/health` exists. ORM models are not API endpoints, and the frontend has not been connected to the database.

## Boundaries

- Clinical selections and the opaque Travel History value are stored as JSONB, without inventing a travel schema.
- Facility IDs and names are stored as the original selected value; there is no fabricated DGHS facility table.
- NDSS patient linkage and authentication are not available yet. Before accepting any patient data, these integration and access-control requirements must be resolved.
- Date conversion, full conditional validation, and frontend JSON serialization are deferred to Phase 4.
- The parent `updated_at` is updated by SQLAlchemy on parent-row updates; changes made only to child rows must explicitly update the parent in the future service layer.
