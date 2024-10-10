# The Schedule is stored in the database as a string.
# However, it is created with a JSON object and returns a JSON object
from pydantic import BaseModel
from sqlmodel import SQLModel

from .mixins import IdMixin


class ScheduleInfo(BaseModel):
    startDate: str
    endDate: str | None
    daysBetween: int
    skipWeekends: bool
    skipHolidays: bool
    timesOfDay: list[str]


# Properties to receive on Schedule creation
class ScheduleCreate(SQLModel):
    schedule: ScheduleInfo


# Database model
class Schedule(SQLModel, IdMixin, table=True):
    schedule: str


# Properties to return via API for a single Schedule
class SchedulePublic(BaseModel):
    schedule: ScheduleInfo
    id: int
