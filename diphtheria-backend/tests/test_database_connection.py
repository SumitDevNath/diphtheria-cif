"""Read-only integration tests requiring a configured local PostgreSQL DB."""

from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import get_engine, get_session_factory


def test_connects_to_selected_database() -> None:
    with get_engine().connect() as connection:
        actual_name = connection.execute(
            text("SELECT current_database()")
        ).scalar_one()

    assert actual_name == get_settings().db_name


def test_session_can_execute_read_only_query() -> None:
    with get_session_factory()() as session:
        assert session.execute(
            text("SELECT 1")
        ).scalar_one() == 1