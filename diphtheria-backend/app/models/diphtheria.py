
"""Diphtheria CIF persistence models with facility ownership."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def empty_clinical_selections() -> dict[str, dict[str, Any]]:
    return {
        group: {
            "selected": [],
            "customOptions": [],
            "otherSelected": False,
            "otherDraft": "",
        }
        for group in (
            "symptoms",
            "signs",
            "complications",
            "comorbidConditions",
        )
    }


class DiphtheriaInvestigation(Base):
    __tablename__ = "diphtheria_investigations"

    __table_args__ = (
        CheckConstraint(
            "facility_id IS NULL OR length(btrim(facility_id)) > 0",
            name="ck_diph_facility_owner",
        ),
        CheckConstraint(
            "identification_ethnicity IS NULL OR "
            "identification_ethnicity IN "
            "('bengali', 'tribal-national', 'non-national')",
            name="ck_diph_ethnicity",
        ),
        CheckConstraint(
            "identification_pregnancy_status IS NULL OR "
            "identification_pregnancy_status IN "
            "('pregnant', 'non-pregnant')",
            name="ck_diph_pregnancy_status",
        ),
        CheckConstraint(
            "vitals_temperature_unit IN ('C', 'F')",
            name="ck_diph_temperature_unit",
        ),
        CheckConstraint(
            "vitals_avpu IS NULL OR vitals_avpu IN "
            "('alert', 'voice', 'pain', 'unresponsive')",
            name="ck_diph_avpu",
        ),
        CheckConstraint(
            "background_contact_known_case IS NULL OR "
            "background_contact_known_case IN ('yes', 'no', 'unknown')",
            name="ck_diph_contact_known_case",
        ),
        CheckConstraint(
            "background_similar_illness_in_family IN ('yes', 'no')",
            name="ck_diph_similar_illness",
        ),
        CheckConstraint(
            "background_healthcare_visit IN ('yes', 'no')",
            name="ck_diph_healthcare_visit",
        ),
        CheckConstraint(
            "(background_healthcare_facility_id IS NULL) = "
            "(background_healthcare_facility_name IS NULL)",
            name="ck_diph_background_facility_pair",
        ),
        CheckConstraint(
            "vaccination_source IS NULL OR "
            "vaccination_source IN ('card', 'history')",
            name="ck_diph_vaccination_source",
        ),
        CheckConstraint(
            "vaccination_doses IS NULL OR vaccination_doses >= 0",
            name="ck_diph_vaccination_doses",
        ),
        CheckConstraint(
            "jsonb_typeof(clinical_selections) = 'object'",
            name="ck_diph_clinical_selections_object",
        ),
        CheckConstraint(
            "(clinical_hospital_id IS NULL) = "
            "(clinical_hospital_name IS NULL)",
            name="ck_diph_clinical_hospital_pair",
        ),
        CheckConstraint(
            "treatment_antibiotics_administered IS NULL OR "
            "treatment_antibiotics_administered IN ('yes', 'no')",
            name="ck_diph_antibiotics_administered",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    facility_id: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Case identification
    identification_mother_name: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    identification_occupation: Mapped[str | None] = mapped_column(Text)
    identification_ethnicity: Mapped[str | None] = mapped_column(String(24))
    identification_pregnancy_status: Mapped[str | None] = mapped_column(
        String(16)
    )
    identification_examination_date: Mapped[date | None] = mapped_column(Date)
    identification_school_name: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )

    # Vitals
    vitals_heart_rate: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    vitals_respiratory_rate: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    vitals_temperature: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    vitals_temperature_unit: Mapped[str] = mapped_column(
        String(1),
        nullable=False,
        default="C",
        server_default=text("'C'"),
    )
    vitals_blood_pressure: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    vitals_oxygen_saturation: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    vitals_avpu: Mapped[str | None] = mapped_column(String(16))

    # Background
    background_contact_known_case: Mapped[str | None] = mapped_column(
        String(8)
    )
    background_contact_details: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    background_household_size: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    background_caregivers_treated: Mapped[str | None] = mapped_column(
        String(16)
    )
    background_similar_illness_in_family: Mapped[str | None] = mapped_column(
        String(3), nullable=True
    )
    background_similar_illness_details: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    background_healthcare_visit: Mapped[str | None] = mapped_column(
        String(3), nullable=True
    )
    background_healthcare_visit_date: Mapped[date | None] = mapped_column(
        Date
    )
    background_healthcare_facility_id: Mapped[str | None] = mapped_column(
        Text
    )
    background_healthcare_facility_name: Mapped[str | None] = mapped_column(
        Text
    )
    background_travel_history: Mapped[Any | None] = mapped_column(JSONB)

    # Vaccination
    vaccination_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )
    vaccination_source: Mapped[str | None] = mapped_column(String(16))
    vaccination_doses: Mapped[int | None] = mapped_column(Integer)
    vaccination_last_vaccination_date: Mapped[date | None] = mapped_column(
        Date
    )

    # Clinical
    clinical_onset_date: Mapped[date | None] = mapped_column(Date)
    clinical_selections: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=empty_clinical_selections,
    )
    clinical_hospital_id: Mapped[str | None] = mapped_column(Text)
    clinical_hospital_name: Mapped[str | None] = mapped_column(Text)
    clinical_visit_date: Mapped[date | None] = mapped_column(Date)
    clinical_admission_date: Mapped[date | None] = mapped_column(Date)
    clinical_hospital_record_number: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )

    # Treatment
    treatment_antibiotics_administered: Mapped[str | None] = mapped_column(
        String(3)
    )

    antibiotic_rows: Mapped[list[AntibioticTherapy]] = relationship(
        back_populates="investigation",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
        order_by="AntibioticTherapy.position",
    )


class AntibioticTherapy(Base):
    __tablename__ = "diphtheria_antibiotic_therapies"

    __table_args__ = (
        UniqueConstraint(
            "investigation_id",
            "position",
            name="uq_diph_abx_position",
        ),
        CheckConstraint(
            "position >= 0",
            name="ck_diph_abx_position",
        ),
        CheckConstraint(
            "medication_origin IS NULL OR "
            "medication_origin IN ('predefined', 'custom')",
            name="ck_diph_abx_medication_origin",
        ),
        CheckConstraint(
            "administration_route IS NULL OR "
            "administration_route IN ('oral', 'iv', 'im')",
            name="ck_diph_abx_route",
        ),
        CheckConstraint(
            "end_date IS NULL OR start_date IS NULL OR "
            "end_date >= start_date",
            name="ck_diph_abx_date_order",
        ),
    )

    investigation_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey(
            "diphtheria_investigations.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
    )
    position: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    medication: Mapped[str] = mapped_column(
        Text, nullable=False, default=""
    )
    medication_origin: Mapped[str | None] = mapped_column(
        String(12)
    )
    administration_route: Mapped[str | None] = mapped_column(
        String(8)
    )
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)

    investigation: Mapped[DiphtheriaInvestigation] = relationship(
        back_populates="antibiotic_rows",
    )


Index(
    "uq_diph_abx_medication_normalized",
    AntibioticTherapy.investigation_id,
    func.lower(
        func.btrim(
            func.regexp_replace(
                AntibioticTherapy.medication,
                r"\s+",
                " ",
                "g",
            )
        )
    ),
    unique=True,
    postgresql_where=(
        func.length(
            func.btrim(AntibioticTherapy.medication)
        ) > 0
    ),
)
