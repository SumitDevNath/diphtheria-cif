
"""Schema tests: safe without an active PostgreSQL connection."""

from sqlalchemy import CheckConstraint, ForeignKeyConstraint, Index
from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateIndex, CreateTable

from app.db.base import Base
import app.models  # noqa: F401 -- register ORM entities


def test_expected_tables_and_relationships() -> None:
    assert set(Base.metadata.tables) == {
        "diphtheria_investigations",
        "diphtheria_antibiotic_therapies",
    }

    therapy = Base.metadata.tables["diphtheria_antibiotic_therapies"]

    assert {"investigation_id", "id"} == {
        c.name for c in therapy.primary_key.columns
    }

    assert any(
        isinstance(constraint, ForeignKeyConstraint)
        and constraint.ondelete == "CASCADE"
        for constraint in therapy.constraints
    )


def test_postgresql_ddl_contains_expected_types_and_unique_index() -> None:
    dialect = postgresql.dialect()

    investigation = Base.metadata.tables["diphtheria_investigations"]
    therapy = Base.metadata.tables["diphtheria_antibiotic_therapies"]

    ddl = str(
        CreateTable(investigation).compile(dialect=dialect)
    )

    assert "JSONB" in ddl
    assert "TIMESTAMP WITH TIME ZONE" in ddl
    assert "DATE" in ddl
    assert "BOOLEAN" in ddl

    assert len([
        c for c in investigation.constraints
        if isinstance(c, CheckConstraint)
    ]) >= 10

    indexes = [
        idx for idx in therapy.indexes
        if isinstance(idx, Index)
    ]

    assert len(indexes) == 1

    idx_sql = str(
        CreateIndex(indexes[0]).compile(dialect=dialect)
    )

    assert "UNIQUE INDEX" in idx_sql
    assert "WHERE" in idx_sql
    assert "regexp_replace" in idx_sql


def test_default_clinical_groups_are_independent() -> None:
    from app.models.diphtheria import empty_clinical_selections

    first = empty_clinical_selections()
    second = empty_clinical_selections()

    first["symptoms"]["selected"].append("Fever")

    assert second["symptoms"]["selected"] == []
