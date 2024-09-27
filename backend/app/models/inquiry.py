import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.models.response import Response

if TYPE_CHECKING:
    from app.models.scheduled_inquiry import ScheduledInquiry

MIN_LENGTH = 10
MAX_LENGTH = 256


# Shared properties
class InquiryBase(SQLModel):
    text: str = Field(min_length=MIN_LENGTH, max_length=MAX_LENGTH)


# Properties to receive on inquiry creation
class InquiryCreate(InquiryBase):
    text: str = Field(min_length=MIN_LENGTH, max_length=MAX_LENGTH)


# Database model, database table inferred from class name
class Inquiry(InquiryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    text: str = Field(min_length=MIN_LENGTH, max_length=MAX_LENGTH, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    scheduled_inquiries: list["ScheduledInquiry"] = Relationship(
        back_populates="inquiry"
    )
    responses: list["Response"] = Relationship(back_populates="inquiry")


# Properties to return via API, id is always required
class InquiryPublic(InquiryBase):
    id: uuid.UUID
    text: str
    created_at: datetime


class InquriesPublic(SQLModel):
    data: list[InquiryPublic]
    count: int
