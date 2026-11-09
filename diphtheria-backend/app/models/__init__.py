
"""Import all ORM entities here so Alembic can discover their metadata."""

from app.models.diphtheria import (
    AntibioticTherapy,
    DiphtheriaInvestigation,
)

__all__ = ["AntibioticTherapy", "DiphtheriaInvestigation"]
