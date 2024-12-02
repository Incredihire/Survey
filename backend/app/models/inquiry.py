from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.models.response import Response
from app.models.theme import ThemePublic

from .mixins import IdMixin

if TYPE_CHECKING:
    from app.models.theme import Theme

MIN_LENGTH = 10
MAX_LENGTH = 256


# Shared properties
class InquiryBase(SQLModel):
    text: str = Field(min_length=MIN_LENGTH, max_length=MAX_LENGTH)
    theme_id: int | None = Field(
        foreign_key="theme.id", ondelete="CASCADE", nullable=True
    )
    first_scheduled: datetime | None = Field()


# Properties to receive on inquiry creation
class InquiryCreate(InquiryBase):
    text: str = Field(min_length=MIN_LENGTH, max_length=MAX_LENGTH)


# Properties to receive on inquiry update
class InquiryUpdate(InquiryBase):
    id: int


# Properties to receive on inquiry delete
class InquiryDelete(InquiryBase):
    id: int


# Database model, database table inferred from class name
class Inquiry(InquiryBase, IdMixin, table=True):
    text: str = Field(min_length=MIN_LENGTH, max_length=MAX_LENGTH, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responses: list["Response"] = Relationship(back_populates="inquiry")
    theme: "Theme" = Relationship(back_populates="inquiries")


# Properties to return via API, id is always required
class InquiryPublic(InquiryBase):
    id: int
    text: str
    created_at: datetime
    first_scheduled: datetime | None
    theme: ThemePublic | None = None


class InquriesPublic(SQLModel):
    data: list[InquiryPublic]
    count: int
