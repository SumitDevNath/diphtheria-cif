
"""Allow nullable background switches as defined in the React/Phase 4 contract.

Revision ID: 20261109_02
Revises: 20261109_01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261109_02"
down_revision: Union[str, Sequence[str], None] = "20261109_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "diphtheria_investigations",
        "background_similar_illness_in_family",
        existing_type=sa.String(length=3),
        nullable=True,
        server_default=None,
        existing_server_default=sa.text("'no'"),
    )

    op.alter_column(
        "diphtheria_investigations",
        "background_healthcare_visit",
        existing_type=sa.String(length=3),
        nullable=True,
        server_default=None,
        existing_server_default=sa.text("'no'"),
    )


def downgrade() -> None:
    # Only valid if no existing rows contain null in these columns.
    op.alter_column(
        "diphtheria_investigations",
        "background_healthcare_visit",
        existing_type=sa.String(length=3),
        nullable=False,
        server_default=sa.text("'no'"),
    )

    op.alter_column(
        "diphtheria_investigations",
        "background_similar_illness_in_family",
        existing_type=sa.String(length=3),
        nullable=False,
        server_default=sa.text("'no'"),
    )
