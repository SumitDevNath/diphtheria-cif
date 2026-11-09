
"""Initial Diphtheria CIF persistence schema.

Revision ID: 20261109_01
Revises:
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20261109_01"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "diphtheria_investigations",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True
        ),
        sa.Column(
            "created_at", sa.DateTime(timezone=True),
            nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True),
            nullable=False, server_default=sa.func.now()
        ),

        # Identification
        sa.Column("identification_mother_name", sa.Text(), nullable=False),
        sa.Column("identification_occupation", sa.Text(), nullable=True),
        sa.Column("identification_ethnicity", sa.String(24), nullable=True),
        sa.Column("identification_pregnancy_status", sa.String(16), nullable=True),
        sa.Column("identification_examination_date", sa.Date(), nullable=True),
        sa.Column("identification_school_name", sa.Text(), nullable=False),

        # Vitals
        sa.Column("vitals_heart_rate", sa.Text(), nullable=False),
        sa.Column("vitals_respiratory_rate", sa.Text(), nullable=False),
        sa.Column("vitals_temperature", sa.Text(), nullable=False),
        sa.Column(
            "vitals_temperature_unit", sa.String(1),
            nullable=False, server_default=sa.text("'C'")
        ),
        sa.Column("vitals_blood_pressure", sa.Text(), nullable=False),
        sa.Column("vitals_oxygen_saturation", sa.Text(), nullable=False),
        sa.Column("vitals_avpu", sa.String(16), nullable=True),

        # Background
        sa.Column("background_contact_known_case", sa.String(8), nullable=True),
        sa.Column("background_contact_details", sa.Text(), nullable=False),
        sa.Column("background_household_size", sa.Text(), nullable=False),
        sa.Column("background_caregivers_treated", sa.String(16), nullable=True),
        sa.Column(
            "background_similar_illness_in_family", sa.String(3),
            nullable=False, server_default=sa.text("'no'")
        ),
        sa.Column("background_similar_illness_details", sa.Text(), nullable=False),
        sa.Column(
            "background_healthcare_visit", sa.String(3),
            nullable=False, server_default=sa.text("'no'")
        ),
        sa.Column("background_healthcare_visit_date", sa.Date(), nullable=True),
        sa.Column("background_healthcare_facility_id", sa.Text(), nullable=True),
        sa.Column("background_healthcare_facility_name", sa.Text(), nullable=True),
        sa.Column("background_travel_history", postgresql.JSONB(), nullable=True),

        # Vaccination
        sa.Column(
            "vaccination_available", sa.Boolean(),
            nullable=False, server_default=sa.text("false")
        ),
        sa.Column("vaccination_source", sa.String(16), nullable=True),
        sa.Column("vaccination_doses", sa.Integer(), nullable=True),
        sa.Column("vaccination_last_vaccination_date", sa.Date(), nullable=True),

        # Clinical
        sa.Column("clinical_onset_date", sa.Date(), nullable=True),
        sa.Column("clinical_selections", postgresql.JSONB(), nullable=False),
        sa.Column("clinical_hospital_id", sa.Text(), nullable=True),
        sa.Column("clinical_hospital_name", sa.Text(), nullable=True),
        sa.Column("clinical_visit_date", sa.Date(), nullable=True),
        sa.Column("clinical_admission_date", sa.Date(), nullable=True),
        sa.Column("clinical_hospital_record_number", sa.Text(), nullable=False),

        # Treatment
        sa.Column(
            "treatment_antibiotics_administered",
            sa.String(3),
            nullable=True,
        ),

        # Constraints
        sa.CheckConstraint(
            "identification_ethnicity IS NULL OR identification_ethnicity "
            "IN ('bengali', 'tribal-national', 'non-national')",
            name="ck_diph_ethnicity",
        ),
        sa.CheckConstraint(
            "identification_pregnancy_status IS NULL OR "
            "identification_pregnancy_status IN ('pregnant', 'non-pregnant')",
            name="ck_diph_pregnancy_status",
        ),
        sa.CheckConstraint(
            "vitals_temperature_unit IN ('C', 'F')",
            name="ck_diph_temperature_unit",
        ),
        sa.CheckConstraint(
            "vitals_avpu IS NULL OR "
            "vitals_avpu IN ('alert', 'voice', 'pain', 'unresponsive')",
            name="ck_diph_avpu",
        ),
        sa.CheckConstraint(
            "background_contact_known_case IS NULL OR "
            "background_contact_known_case IN ('yes', 'no', 'unknown')",
            name="ck_diph_contact_known_case",
        ),
        sa.CheckConstraint(
            "background_similar_illness_in_family IN ('yes', 'no')",
            name="ck_diph_similar_illness",
        ),
        sa.CheckConstraint(
            "background_healthcare_visit IN ('yes', 'no')",
            name="ck_diph_healthcare_visit",
        ),
        sa.CheckConstraint(
            "(background_healthcare_facility_id IS NULL) = "
            "(background_healthcare_facility_name IS NULL)",
            name="ck_diph_background_facility_pair",
        ),
        sa.CheckConstraint(
            "vaccination_source IS NULL OR "
            "vaccination_source IN ('card', 'history')",
            name="ck_diph_vaccination_source",
        ),
        sa.CheckConstraint(
            "vaccination_doses IS NULL OR vaccination_doses >= 0",
            name="ck_diph_vaccination_doses",
        ),
        sa.CheckConstraint(
            "jsonb_typeof(clinical_selections) = 'object'",
            name="ck_diph_clinical_selections_object",
        ),
        sa.CheckConstraint(
            "(clinical_hospital_id IS NULL) = "
            "(clinical_hospital_name IS NULL)",
            name="ck_diph_clinical_hospital_pair",
        ),
        sa.CheckConstraint(
            "treatment_antibiotics_administered IS NULL OR "
            "treatment_antibiotics_administered IN ('yes', 'no')",
            name="ck_diph_antibiotics_administered",
        ),
    )

    op.create_table(
        "diphtheria_antibiotic_therapies",
        sa.Column(
            "investigation_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), nullable=False
        ),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("medication", sa.Text(), nullable=False),
        sa.Column("medication_origin", sa.String(12), nullable=True),
        sa.Column("administration_route", sa.String(8), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),

        sa.PrimaryKeyConstraint(
            "investigation_id", "id"
        ),
        sa.UniqueConstraint(
            "investigation_id",
            "position",
            name="uq_diph_abx_position",
        ),
        sa.ForeignKeyConstraint(
            ["investigation_id"],
            ["diphtheria_investigations.id"],
            ondelete="CASCADE",
        ),
        sa.CheckConstraint(
            "position >= 0",
            name="ck_diph_abx_position",
        ),
        sa.CheckConstraint(
            "medication_origin IS NULL OR "
            "medication_origin IN ('predefined', 'custom')",
            name="ck_diph_abx_medication_origin",
        ),
        sa.CheckConstraint(
            "administration_route IS NULL OR "
            "administration_route IN ('oral', 'iv', 'im')",
            name="ck_diph_abx_route",
        ),
        sa.CheckConstraint(
            "end_date IS NULL OR start_date IS NULL OR "
            "end_date >= start_date",
            name="ck_diph_abx_date_order",
        ),
    )

    # Permit empty medication placeholders in unfinished drafts.
    op.create_index(
        "uq_diph_abx_medication_normalized",
        "diphtheria_antibiotic_therapies",
        [
            "investigation_id",
            sa.text(
                r"lower(btrim(regexp_replace(medication, '\s+', ' ', 'g')))"
            ),
        ],
        unique=True,
        postgresql_where=sa.text(
            "length(btrim(medication)) > 0"
        ),
    )


def downgrade() -> None:
    # Destructive: never run against real patient records.
    op.drop_index(
        "uq_diph_abx_medication_normalized",
        table_name="diphtheria_antibiotic_therapies",
    )
    op.drop_table("diphtheria_antibiotic_therapies")
    op.drop_table("diphtheria_investigations")
