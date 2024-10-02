"""
Survey models
~~~~~~~~~~~~~

Basic usage:
    >>> from app.models import User, UserCreate

Important:
    Models that inherit from SQLModel and are configured with table=true, should be added as strings to __all__,
    otherwise migrations will not work properly.

    https://sqlmodel.tiangolo.com/tutorial/create-db-and-table/?h=metadata#sqlmodel-metadata
"""

from .auth import Message, NewPassword, Token, TokenPayload, UpdatePassword
from .inquiry import Inquiry, InquiryCreate, InquiryPublic, InquriesPublic
from .item import Item, ItemCreate, ItemPublic, ItemsPublic, ItemUpdate
from .response import Response, ResponseCreate, ResponsePublic, ResponsesPublic
from .schedule import Schedule, ScheduleCreate, ScheduleData, SchedulePublic
from .scheduled_inquiry import (
    ScheduledInquiriesPublic,
    ScheduledInquiry,
    ScheduledInquiryCreate,
    ScheduledInquiryPublic,
)
from .theme import Theme, ThemeCreate, ThemePublic, ThemesPublic
from .user import (
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)

# https://realpython.com/python-all-attribute/#names-from-a-package
__all__ = [
    # auth model
    "Message",
    "NewPassword",
    "Token",
    "TokenPayload",
    "UpdatePassword",
    # inquiry model
    "Inquiry",
    "InquiryCreate",
    "InquiryPublic",
    "InquiryPublic",
    "InquriesPublic",
    # theme model
    "Theme",
    "ThemeCreate",
    "ThemePublic",
    "ThemesPublic",
    # item model
    "Item",
    "ItemCreate",
    "ItemPublic",
    "ItemsPublic",
    "ItemUpdate",
    # user model
    "User",
    "UserCreate",
    "UserPublic",
    "UserRegister",
    "UsersPublic",
    "UserUpdate",
    "UserUpdateMe",
    # response model
    "Response",
    "ResponseCreate",
    "ResponsePublic",
    "ResponsesPublic",
    # scheduled_inquiry model
    "ScheduledInquiry",
    "ScheduledInquiryCreate",
    "ScheduledInquiryPublic",
    "ScheduledInquiriesPublic",
    # schedule model
    "Schedule",
    "ScheduleCreate",
    "SchedulePublic",
    "ScheduleData",
]
