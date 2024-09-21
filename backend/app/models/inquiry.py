import uuid
from datetime import datetime, timezone
from typing import List

from backend.app.models.response import Response
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class InquiryBase(SQLModel):
    text: str = Field(min_length=10, max_length=255)


class InquiryCreate(InquiryBase):
    text: str = Field(min_length=10, max_length=255)


# Database model, database table inferred from class name
class Inquiry(InquiryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    text: str = Field(min_length=10, max_length=255, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responses: List[Response] = Relationship(back_populates="inquiry")


# Properties to return via API, id is always required
class InquiryPublic(InquiryBase):
    id: uuid.UUID
    text: str
    created_at: datetime


class InquriesPublic(SQLModel):
    data: list[InquiryPublic]
    count: int
