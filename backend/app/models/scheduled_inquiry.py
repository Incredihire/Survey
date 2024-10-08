from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from .mixins import IdMixin

if TYPE_CHECKING:
    from app.models.inquiry import Inquiry


# Shared properties
class ScheduledInquiryBase(SQLModel):
    inquiry_id: int = Field(foreign_key="inquiry.id", ondelete="CASCADE")
    rank: int = Field(ge=1)  # rank starts at 1


# Properties to receive on ScheduledInquiry creation
class ScheduledInquiryCreate(SQLModel):
    inquiry_id: int = Field(foreign_key="inquiry.id")


# Database model
class ScheduledInquiry(ScheduledInquiryBase, IdMixin, table=True):
    # Relationships
    inquiry: "Inquiry" = Relationship(back_populates="scheduled_inquiries")


# Properties to return via API. Contains Inquiry text.
class ScheduledInquiryPublic(ScheduledInquiryBase):
    id: int


class ScheduledInquiryPublicWithInquiryText(ScheduledInquiryPublic):
    text: str


# Properties to return via API.
class ScheduledInquiriesPublic(SQLModel):
    data: list[ScheduledInquiryPublicWithInquiryText]
    count: int
