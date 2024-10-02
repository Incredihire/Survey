# The Schedule is stored in the database as a string.
# However, it is created with a JSON object and returns a JSON object
import uuid

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class ScheduleData(BaseModel):
    startDate: str
    endDate: str | None
    daysBetween: int
    skipWeekends: bool
    skipHolidays: bool
    timesOfDay: list[str]


# Properties to receive on Schedule creation
class ScheduleCreate(SQLModel):
    schedule: ScheduleData


# Database model
class Schedule(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    schedule: str


# Properties to return via API for a single Schedule
class SchedulePublic(BaseModel):
    schedule: ScheduleData
    id: uuid.UUID
