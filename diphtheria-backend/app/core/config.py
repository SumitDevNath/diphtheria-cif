
"""Environment-based database and security configuration."""

from functools import lru_cache
from pathlib import Path
from urllib.parse import urlsplit

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """PostgreSQL connection settings."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    db_host: str = Field(min_length=1)
    db_port: int = Field(ge=1, le=65535)
    db_name: str = Field(min_length=1)
    db_user: str = Field(min_length=1)
    db_password: SecretStr = Field(min_length=1)


@lru_cache
def get_settings() -> Settings:
    return Settings()


class SecuritySettings(BaseSettings):
    """CORS, request limits, and trusted DGHS endpoint configuration."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    cors_allowed_origins: str = ""
    max_request_body_bytes: int = Field(
        default=2_097_152,
        ge=1024,
        le=10_485_760,
    )
    dghs_auth_validate_url: str | None = None

    @field_validator("dghs_auth_validate_url")
    @classmethod
    def validate_dghs_url(
        cls, value: str | None
    ) -> str | None:
        if value is None:
            return None

        parsed = urlsplit(value)

        if (
            parsed.scheme != "https"
            or not parsed.hostname
            or parsed.username is not None
            or parsed.password is not None
            or parsed.query
            or parsed.fragment
            or not parsed.path
            or parsed.port not in (None, 443)
        ):
            raise ValueError(
                "DGHS validation URL must be a clean HTTPS endpoint."
            )

        return value

    @field_validator("cors_allowed_origins")
    @classmethod
    def validate_origins(cls, raw: str) -> str:
        for origin in (
            part.strip() for part in raw.split(",")
        ):
            if not origin:
                continue

            parsed = urlsplit(origin)

            if (
                parsed.scheme not in ("http", "https")
                or not parsed.hostname
                or parsed.username is not None
                or parsed.password is not None
                or parsed.path
                or parsed.query
                or parsed.fragment
                or origin != f"{parsed.scheme}://{parsed.netloc}"
            ):
                raise ValueError(
                    "CORS origins must be explicit HTTP(S) origins."
                )

            if (
                parsed.scheme == "http"
                and parsed.hostname not in (
                    "localhost",
                    "127.0.0.1",
                    "::1",
                )
            ):
                raise ValueError(
                    "Non-local CORS origins must use HTTPS."
                )

        return raw

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_allowed_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_security_settings() -> SecuritySettings:
    return SecuritySettings()
