"""Alembic environment using the same DB settings as the FastAPI app."""

from alembic import context

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import build_database_url, get_engine

config = context.config

# Import actual ORM models in Phase 3 before autogenerating revisions.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = build_database_url(
        get_settings()
    ).render_as_string(hide_password=False)

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    with get_engine().connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()