
"""API envelope: investigation metadata is separate from React form data."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.diphtheria import DiphtheriaFormResponse


class InvestigationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    createdAt: datetime
    updatedAt: datetime
    form: DiphtheriaFormResponse
