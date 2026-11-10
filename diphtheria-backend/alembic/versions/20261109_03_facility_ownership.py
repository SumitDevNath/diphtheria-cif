
"""Add investigation facility ownership without guessing legacy ownership.

Revision ID: 20261109_03
Revises: 20261109_02
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20261109_03"
down_revision: Union[str, Sequence[str], None] = "20261109_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "diphtheria_investigations",
        sa.Column(
            "facility_id",
            sa.Text(),
            nullable=True,
        ),
    )

    op.create_check_constraint(
        "ck_diph_facility_owner",
        "diphtheria_investigations",
        "facility_id IS NULL OR length(btrim(facility_id)) > 0",
    )

    op.create_index(
        "ix_diphtheria_investigations_facility_id",
        "diphtheria_investigations",
        ["facility_id"],
    )


def downgrade() -> None:
    # Destructive: removes ownership information.
    # Do not run against a database with stored investigations.
    op.drop_index(
        "ix_diphtheria_investigations_facility_id",
        table_name="diphtheria_investigations",
    )

    op.drop_constraint(
        "ck_diph_facility_owner",
        "diphtheria_investigations",
        type_="check",
    )

    op.drop_column(
        "diphtheria_investigations",
        "facility_id",
    )
