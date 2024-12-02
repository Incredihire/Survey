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

from .auth import Message, Token, TokenPayload
from .inquiry import (
    Inquiry,
    InquiryCreate,
    InquiryDelete,
    InquiryPublic,
    InquiryUpdate,
    InquriesPublic,
)
from .response import Response, ResponseCreate, ResponsePublic, ResponsesPublic
from .schedule import Schedule, ScheduleCreate, ScheduleInfo, SchedulePublic
from .theme import Theme, ThemeCreate, ThemePublic, ThemesPublic
from .user import (
    User,
    UserCreate,
    UserPublic,
    UsersPublic,
)

# https://realpython.com/python-all-attribute/#names-from-a-package
__all__ = [
    # auth model
    "Message",
    "Token",
    "TokenPayload",
    # inquiry model
    "Inquiry",
    "InquiryCreate",
    "InquiryPublic",
    "InquriesPublic",
    "InquiryUpdate",
    "InquiryDelete",
    # theme model
    "Theme",
    "ThemeCreate",
    "ThemePublic",
    "ThemesPublic",
    # user model
    "User",
    "UserCreate",
    "UserPublic",
    "UsersPublic",
    # response model
    "Response",
    "ResponseCreate",
    "ResponsePublic",
    "ResponsesPublic",
    # schedule model
    "Schedule",
    "ScheduleCreate",
    "SchedulePublic",
    "ScheduleInfo",
]
