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

# NDSS Authentication Integration Requirements

## Known information

A development authentication validation URL was provided:

https://dev.surveillance.dghs.gov.bd/api/auth/api/v1/auth/validate

The public NDSS website identifies an existing government SSO.

The validation endpoint's authenticated protocol and response schema
have not been verified.

## Information required from the NDSS backend team

1. Supported validation method: GET, POST, or another method.
2. Required Authorization header, cookies, and service credentials.
3. Expected request Content-Type and request body, if any.
4. Successful validation response schema, including trusted identity.
5. Expiration, revocation, and unsuccessful validation behavior.
6. Trusted roles, permissions, and organization/facility identifiers.
7. Create, read, and update permissions for Diphtheria investigations.
8. How each record is linked to a patient and NDSS case.
9. How record-level access is checked against an authenticated user.
10. Trusted date of birth and sex source for conditional validation.
11. Approved Travel History validator and its integration boundary.
12. Cross-origin cookie requirements and CSRF controls, if applicable.

## Implementation decision

The application does not create separate users, passwords, login
endpoints, JWT issuers, or production roles.

`require_ndss_access` and `get_trusted_submission_context` continue
to deny access until the approved NDSS integration is available.

No credential is forwarded to the provided validation URL yet.
The backend must not trust decoded JWT claims or upstream response
fields without confirmed validation and authorization semantics.

## Required authorization rule

Before accessing an individual investigation, the approved NDSS
integration must establish both:

- A trusted authenticated requester permitted to perform the action.
- The requester's permission to access that specific investigation.

Knowing a record UUID does not grant access.

## Operational security

- Require HTTPS for deployed services.
- Restrict CORS to approved application origins.
- Keep real credentials outside Git.
- Never log patient form payloads, passwords, cookies, or tokens.
- Review trusted reverse-proxy configuration.
- Define request-rate protections with the NDSS operations team.
- Confirm audit-log requirements without exposing patient content.
- Keep authentication dependencies enabled on every sensitive route.
- Review cookie/CSRF requirements before enabling credentialed CORS.

## Verification required before enabling patient APIs

- Missing or invalid credential -> unauthorized.
- Valid identity without permission -> forbidden.
- Authorized user accessing an out-of-scope record -> denied.
- Auth service unavailable -> access denied, never bypassed.
- Revoked or expired credentials -> denied.
- No patient data in logs or error responses.
- Authentication and record authorization tested against approved NDSS services.

These checks cannot be marked complete until the actual NDSS
integration contract is provided and tested.
