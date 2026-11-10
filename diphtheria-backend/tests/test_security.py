
"""Middleware security tests without DGHS credentials or database access."""

import asyncio

import httpx
import pytest
from pydantic import ValidationError

from app.core.config import SecuritySettings
from app.main import create_app


def settings(origins="", size=1024):
    return SecuritySettings(
        _env_file=None,
        cors_allowed_origins=origins,
        max_request_body_bytes=size,
    )


def send(configuration, method, path, **kwargs):
    async def run():
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(
                app=create_app(configuration)
            ),
            base_url="http://testserver",
        ) as client:
            return await client.request(
                method,
                path,
                **kwargs,
            )

    return asyncio.run(run())


def test_protected_route_requires_bearer_header():
    response = send(
        settings(),
        "GET",
        "/api/v1/diphtheria/investigations/"
        "00000000-0000-0000-0000-000000000001",
    )

    assert response.status_code == 401
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-content-type-options"] == "nosniff"


def test_health_is_public_and_secure_headers_exist():
    response = send(
        settings(),
        "GET",
        "/health",
    )

    assert response.status_code == 200
    assert response.headers["x-frame-options"] == "DENY"


def test_cors_permits_only_configured_origin():
    configured = settings("http://localhost:5173")

    allowed = send(
        configured,
        "OPTIONS",
        "/api/v1/diphtheria/investigations",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers":
                "authorization,content-type",
        },
    )

    assert allowed.status_code == 200
    assert (
        allowed.headers["access-control-allow-origin"]
        == "http://localhost:5173"
    )

    denied = send(
        configured,
        "OPTIONS",
        "/api/v1/diphtheria/investigations",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert denied.status_code == 400


@pytest.mark.parametrize(
    "origin",
    [
        "*",
        "http://example.org",
        "https://example.org/path",
    ],
)
def test_invalid_origins_are_rejected(origin):
    with pytest.raises(ValidationError):
        settings(origin)


def test_large_body_is_rejected():
    response = send(
        settings(),
        "POST",
        "/api/v1/diphtheria/investigations",
        content=b"x" * 1025,
    )

    assert response.status_code == 413


def test_small_body_still_requires_authentication():
    response = send(
        settings(),
        "POST",
        "/api/v1/diphtheria/investigations",
        content=b"{}",
        headers={
            "Content-Type": "application/json",
        },
    )

    assert response.status_code == 401


def test_streamed_body_cannot_bypass_limit():
    async def chunks():
        yield b"x" * 600
        yield b"x" * 600

    response = send(
        settings(),
        "POST",
        "/api/v1/diphtheria/investigations",
        content=chunks(),
    )

    assert response.status_code == 413


def test_no_cors_origins_by_default():
    response = send(
        settings(),
        "GET",
        "/health",
        headers={
            "Origin": "http://localhost:5173",
        },
    )

    assert (
        "access-control-allow-origin"
        not in response.headers
    )
