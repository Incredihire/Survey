from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Column
from sqlmodel import Field, Relationship, SQLModel

from app.models.inquiry import InquiryPublic
from app.models.response import Response
from app.models.user import UserPublic

from .mixins import IdMixin

if TYPE_CHECKING:
    from app.models.inquiry import Inquiry, InquiryPublic
    from app.models.user import User, UserPublic


class ActionType(str, Enum):
    CREATE = "Create"
    UPDATE = "Update"
    DELETE = "Delete"


# Shared properties
class InquiryHistoryBase(SQLModel):
    user_id: int = Field(foreign_key="user.id", ondelete="SET NULL", nullable=True)
    inquiry_id: int = Field(
        foreign_key="inquiry.id", ondelete="SET NULL", nullable=True
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    action: ActionType = Field(default=ActionType.CREATE, nullable=False)
    new_data: dict = Field(sa_column=Column(JSON), default_factory=dict)

    class Config:
        arbitrary_types_allowed = True


# Properties to receive on inquiry creation
class InquiryHistoryCreate(InquiryHistoryBase):
    action: ActionType = Field(default=ActionType.CREATE, nullable=False)
    user_id: int = Field(foreign_key="user.id", ondelete="SET NULL")
    inquiry_id: int = Field(foreign_key="inquiry.id", ondelete="SET NULL")
    new_data: dict = Field(sa_column=Column(JSON), default_factory=dict)


# Database model, database table inferred from class name
class InquiryHistory(InquiryHistoryBase, IdMixin, table=True):
    user: "User" = Relationship(back_populates="inquiries_histories")
    inquiry: "Inquiry" = Relationship(back_populates="inquiries_histories")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responses: list["Response"] = Relationship(back_populates="inquiry_history")
    new_data: dict = Field(sa_column=Column(JSON), default_factory=dict)
    action: ActionType = Field(default=ActionType.CREATE, nullable=False)


# Properties to return via API, id is always required
class InquiryHistoryPublic(InquiryHistoryBase):
    id: int
    action: str
    created_at: datetime
    new_data: dict | None
    user: UserPublic
    inquiry: InquiryPublic


class InquiriesHistoryPublic(SQLModel):
    data: list[InquiryHistoryPublic]
    count: int
