
"""Pure-ASGI security middleware; does not implement NDSS authentication."""

from starlette.datastructures import MutableHeaders
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class RequestBodyLimitMiddleware:
    """Reject oversized requests before an endpoint processes them."""

    def __init__(self, app: ASGIApp, max_body_bytes: int) -> None:
        self.app = app
        self.max_body_bytes = max_body_bytes

    async def __call__(
        self, scope: Scope, receive: Receive, send: Send
    ) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def reject(status_code: int, detail: str) -> None:
            response = JSONResponse(
                {"detail": detail},
                status_code=status_code,
            )
            await response(scope, receive, send)

        lengths = [
            value
            for key, value in scope.get("headers", [])
            if key.lower() == b"content-length"
        ]

        if len(lengths) > 1 or (
            lengths and not lengths[0].isdigit()
        ):
            await reject(400, "Invalid Content-Length header.")
            return

        if lengths and int(lengths[0]) > self.max_body_bytes:
            await reject(
                413, "Request body exceeds the configured size limit."
            )
            return

        messages: list[Message] = []
        size = 0

        while True:
            message = await receive()

            if message["type"] == "http.disconnect":
                return

            if message["type"] != "http.request":
                continue

            size += len(message.get("body", b""))

            if size > self.max_body_bytes:
                await reject(
                    413, "Request body exceeds the configured size limit."
                )
                return

            messages.append(message)

            if not message.get("more_body", False):
                break

        queued = iter(messages)

        async def replay_receive() -> Message:
            try:
                return next(queued)
            except StopIteration:
                return await receive()

        await self.app(scope, replay_receive, send)


class SecurityHeadersMiddleware:
    """Add security headers without accessing request/response bodies."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(
        self, scope: Scope, receive: Receive, send: Send
    ) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)

                headers["X-Content-Type-Options"] = "nosniff"
                headers["Referrer-Policy"] = "no-referrer"
                headers["X-Frame-Options"] = "DENY"

                if scope["path"].startswith(
                    "/api/v1/diphtheria/"
                ):
                    headers["Cache-Control"] = "no-store"

            await send(message)

        await self.app(scope, receive, send_with_headers)
