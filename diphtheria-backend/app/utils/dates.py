
"""Strict frontend DD-MM-YYYY <-> database DATE conversion helpers."""

import re
from datetime import date, datetime, timedelta, timezone

_DATE_PATTERN = re.compile(r"(\d{2})-(\d{2})-(\d{4})", re.ASCII)
_BANGLADESH_TIMEZONE = timezone(timedelta(hours=6))


def local_today() -> date:
    """Surveillance-local calendar date (Bangladesh UTC+06:00)."""
    return datetime.now(_BANGLADESH_TIMEZONE).date()


def parse_dmy(value: str) -> date | None:
    """Empty frontend input -> None; invalid or incomplete dates -> ValueError."""
    if not value.strip():
        return None
    match = _DATE_PATTERN.fullmatch(value)
    if match is None:
        raise ValueError("Enter a valid date (DD-MM-YYYY).")
    day, month, year = (int(part) for part in match.groups())
    try:
        return date(year, month, day)
    except ValueError as exc:
        raise ValueError("Enter a valid date (DD-MM-YYYY).") from exc


def format_dmy(value: date | None) -> str:
    """Database DATE -> unchanged frontend date representation."""
    return value.strftime("%d-%m-%Y") if value is not None else ""
