"""Database configuration tests that do not connect to PostgreSQL."""

from app.core.config import Settings
from app.db.session import build_database_url


def test_connection_url_keeps_special_characters_in_password() -> None:
    settings = Settings(
        _env_file=None,
        db_host="localhost",
        db_port=5433,
        db_name="example_db",
        db_user="example_user",
        db_password="example@:/?secret",
    )

    url = build_database_url(settings)

    assert url.drivername == "postgresql+psycopg"
    assert url.port == 5433
    assert url.password == "example@:/?secret"
    assert "example@:/?secret" not in str(url)