# The Schedule is stored in the database as a string.
# However, it is created with a JSON object and returns a JSON object
from datetime import datetime, timedelta

import holidays
from pydantic import BaseModel
from pydantic.fields import computed_field
from sqlmodel import SQLModel

from .mixins import IdMixin


class ScheduleInfo(BaseModel):
    startDate: str
    endDate: str | None
    daysBetween: int
    skipWeekends: bool
    skipHolidays: bool
    timesOfDay: list[str]


class ScheduleInquiriesAndDates(BaseModel):
    inquiries: list[int]
    dates: list[str]


# Properties to receive on Schedule creation
class ScheduleCreate(SQLModel):
    schedule: ScheduleInfo


# Database model
class Schedule(SQLModel, IdMixin, table=True):
    schedule: str
    scheduled_inquiries: str


# Properties to return via API for a single Schedule
class SchedulePublic(BaseModel):
    schedule: ScheduleInfo
    id: int | None
    scheduled_inquiries: list[int]

    @computed_field
    def scheduled_inquiries_and_dates(self) -> ScheduleInquiriesAndDates:
        schedule = self.schedule
        scheduled_inquiries = self.scheduled_inquiries
        today = datetime.strptime(
            f"{datetime.now().strftime('%Y-%m-%d')} {schedule.timesOfDay[0]}",
            "%Y-%m-%d %H:%M",
        )
        start = datetime.strptime(
            f"{schedule.startDate} {schedule.timesOfDay[0]}", "%Y-%m-%d %H:%M"
        )
        current_date = start
        past_scheduled_count = 0
        while current_date < today:
            if schedule.skipWeekends:
                while current_date.weekday() in [5, 6]:  # 5: Saturday, 6: Sunday
                    current_date += timedelta(days=1)
            if schedule.skipHolidays:
                us_holidays = holidays.US()  # type: ignore[attr-defined]
                while current_date in us_holidays:  # Adjust country_code as needed
                    current_date += timedelta(days=1)
            current_date += timedelta(days=schedule.daysBetween)
            past_scheduled_count += 1
        scheduled_inquiries_count = len(scheduled_inquiries)
        scheduled_dates: list[str] = []
        for _index in scheduled_inquiries:
            if schedule.skipWeekends:
                while current_date.weekday() in [5, 6]:  # 5: Saturday, 6: Sunday
                    current_date += timedelta(days=1)
            if schedule.skipHolidays:
                us_holidays = holidays.US()  # type: ignore[attr-defined]
                while current_date in us_holidays:  # Adjust country_code as needed
                    current_date += timedelta(days=1)
            scheduled_dates.append(current_date.strftime("%m/%d/%Y %I:%M %p"))
            current_date += timedelta(days=schedule.daysBetween)
        active_index = 0
        if past_scheduled_count > 0 and scheduled_inquiries_count > 0:
            active_index = past_scheduled_count % scheduled_inquiries_count
        return ScheduleInquiriesAndDates(
            inquiries=scheduled_inquiries[active_index:]
            + scheduled_inquiries[:active_index],
            dates=scheduled_dates,
        )
