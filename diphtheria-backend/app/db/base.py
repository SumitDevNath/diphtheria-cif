"""Shared SQLAlchemy metadata; ORM entities are added in Phase 3."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass