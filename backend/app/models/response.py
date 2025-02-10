from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from .mixins import IdMixin

if TYPE_CHECKING:
    from app.models.inquiry import Inquiry
    from app.models.inquiry_history import InquiryHistory
    from app.models.user import User


# Shared properties for Response
class ResponseBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    inquiry_id: int = Field(foreign_key="inquiry.id")
    inquiry_history_id: int = Field(foreign_key="inquiryhistory.id")
    rating: int = Field(ge=1, le=5)  # Assuming rating is between 1 and 5
    comment: str | None = Field(default=None, max_length=1024)
    responded_at: datetime | None = Field(default=None)


# Properties to receive on Response creation
class ResponseCreate(ResponseBase):
    pass


# Database model
class Response(ResponseBase, IdMixin, table=True):
    # Relationships
    user: "User" = Relationship(back_populates="responses")
    inquiry: "Inquiry" = Relationship(back_populates="responses")
    inquiry_history: "InquiryHistory" = Relationship(back_populates="responses")


# Properties to return via API for a single Response
class ResponsePublic(ResponseBase):
    id: int


# Properties to return via API for multiple Responses
class ResponsesPublic(SQLModel):
    data: list[ResponsePublic]
    count: int
