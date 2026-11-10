"""Interactive DGHS auth-validator probe; never logs credentials or response payloads."""

import asyncio
import json
from getpass import getpass
from typing import Any

import httpx

VALIDATE_URL = "https://dev.surveillance.dghs.gov.bd/api/auth/api/v1/auth/validate"
MAX_RESPONSE_BYTES = 65536


def prepare_request() -> tuple[str, dict[str, str], Any | None]:
    method = input("Previously successful HTTP method (GET/POST): ").strip().upper()
    if method not in {"GET", "POST"}:
        raise ValueError("Enter the exact method used previously: GET or POST.")

    headers = {"Accept": "application/json"}
    mode = input("Credential location (bearer/cookie/header/body/none): ").strip().lower()

    if mode == "bearer":
        token = getpass("Paste the token (hidden): ").strip()
        if not token or "\r" in token or "\n" in token:
            raise ValueError("Invalid token.")
        headers["Authorization"] = f"Bearer {token}"
    elif mode == "cookie":
        cookie = getpass("Paste the Cookie header value (hidden): ").strip()
        if not cookie or "\r" in cookie or "\n" in cookie:
            raise ValueError("Invalid cookie header.")
        headers["Cookie"] = cookie
    elif mode == "header":
        name = input("Exact header name from previous request: ").strip()
        if not name or not name.isascii() or not all(
            char.isalnum() or char == "-" for char in name
        ) or name.lower() in {"host", "content-length", "transfer-encoding"}:
            raise ValueError("Invalid custom header name.")
        value = getpass("Header value (hidden): ").strip()
        if not value or "\r" in value or "\n" in value:
            raise ValueError("Invalid header value.")
        headers[name] = value
    elif mode not in {"body", "none"}:
        raise ValueError("Choose bearer, cookie, header, body, or none.")

    body = None
    wants_body = mode == "body" or input("Did the successful call send a JSON body? (y/N): ").strip().lower() == "y"
    if wants_body:
        raw = getpass("Paste exact JSON body from successful call (hidden): ")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError("Request body is not valid JSON.") from exc

    return method, headers, body


def summarize_response(response: httpx.Response) -> None:
    print("HTTP status:", response.status_code)
    if response.status_code == 405:
        print(
            "Allowed HTTP methods:",
            response.headers.get("Allow", "Not provided by server")
        )
    print("Content-Type:", response.headers.get("content-type", "(none)"))
    if response.is_redirect:
        print("Redirect blocked; credentials were not forwarded to another URL.")
        return
    if len(response.content) > MAX_RESPONSE_BYTES:
        print("Response too large to inspect safely.")
        return
    try:
        data = response.json()
    except ValueError:
        print("Response is not JSON; response body withheld.")
        return
    if not isinstance(data, dict):
        print("JSON type:", type(data).__name__, "(values withheld)")
        return

    print("Top-level response keys:", ", ".join(sorted(map(str, data))) or "(none)")
    for key in ("success", "valid", "authenticated", "authorized", "isValid"):
        if type(data.get(key)) is bool:
            print(f"Boolean {key}:", data[key])
    nested = data.get("data")
    if isinstance(nested, dict):
        print("Nested 'data' keys:", ", ".join(sorted(map(str, nested))) or "(none)")
    print("All identity values, tokens, messages, and response bodies withheld.")


async def main() -> None:
    method, headers, body = prepare_request()
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(15.0), follow_redirects=False, trust_env=False
    ) as client:
        try:
            response = await client.request(
                method, VALIDATE_URL, headers=headers, json=body
            )
        except httpx.RequestError as exc:
            print("Connection failed:", type(exc).__name__)
            return
    summarize_response(response)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (ValueError, EOFError, KeyboardInterrupt) as exc:
        if isinstance(exc, ValueError):
            print(f"Probe stopped: {exc}")
        else:
            print("Probe cancelled.")
