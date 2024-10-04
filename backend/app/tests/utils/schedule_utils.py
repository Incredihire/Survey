from typing import TypedDict

from sqlmodel import Session

from ...models import ScheduleCreate
from ...services.schedule import create_schedule
from .json import json_bool_convert


class ScheduleObjectDict(TypedDict):
    startDate: str
    endDate: str
    daysBetween: int
    skipWeekends: str
    skipHolidays: str
    timesOfDay: list[str]


class ScheduleContentDict(TypedDict):
    startDate: str
    endDate: str
    daysBetween: int
    skipWeekends: bool
    skipHolidays: bool
    timesOfDay: list[str]


class ScheduleObject(TypedDict):
    schedule: ScheduleObjectDict


class ScheduleContent(TypedDict):
    schedule: ScheduleContentDict


first_schedule_string = '{"startDate":"2024-10-02","endDate":"2024-11-01","daysBetween":1,"skipWeekends":false,"skipHolidays":false,"timesOfDay":["08:00"]}'
second_schedule_string = '{"startDate":"2024-12-12","endDate":"2024-12-22","daysBetween":1,"skipWeekends":true,"skipHolidays":true,"timesOfDay":["18:00"]}'


first_valid_schedule: ScheduleObject = {
    "schedule": {
        "startDate": "2024-10-02",
        "endDate": "2024-11-01",
        "daysBetween": 1,
        "skipWeekends": "false",
        "skipHolidays": "false",
        "timesOfDay": ["08:00"],
    }
}

second_valid_schedule: ScheduleObject = {
    "schedule": {
        "startDate": "2024-12-12",
        "endDate": "2024-12-22",
        "daysBetween": 1,
        "skipWeekends": "true",
        "skipHolidays": "true",
        "timesOfDay": ["18:00"],
    }
}

schedule_with_missing_attribute = {
    "schedule": {
        "startDate": "2024-12-12",
        "endDate": "2024-12-22",
        "daysBetween": 1,
        "skipWeekends": "true",
        "skipHolidays": "false",
        "timesOfDay": ["six o'clock"],
    }
}

schedule_with_bad_time = {
    "schedule": {
        "startDate": "2024-12-12",
        "endDate": "2024-12-22",
        "daysBetween": 1,
        "skipWeekends": "true",
        "skipHolidays": "false",
        "timesOfDay": ["six o'clock"],
    }
}

schedule_with_bad_date = {
    "schedule": {
        "startDate": "December 10 2024",
        "endDate": "2024-12-22",
        "daysBetween": 1,
        "skipWeekends": "true",
        "skipHolidays": "false",
        "timesOfDay": ["18:00"],
    }
}

not_a_schedule_string = "why do birds suddenly appear every time you are near?"


def create_test_schedule(db: Session, schedule_obj: object) -> None:
    create_schedule(session=db, schedule_in=ScheduleCreate.model_validate(schedule_obj))


def create_first_schedule(db: Session) -> None:
    create_test_schedule(db=db, schedule_obj=first_valid_schedule)


def create_second_schedule(db: Session) -> None:
    create_test_schedule(db=db, schedule_obj=second_valid_schedule)


def assert_response_content_equals_original_object(
    content: ScheduleContent, original_object: ScheduleObject
) -> None:
    content_schedule = content["schedule"]
    original_schedule = original_object["schedule"]
    assert content_schedule["daysBetween"] == original_schedule["daysBetween"]
    assert content_schedule["endDate"] == original_schedule["endDate"]
    assert content_schedule["startDate"] == original_schedule["startDate"]
    assert content_schedule["timesOfDay"] == original_schedule["timesOfDay"]
    assert content_schedule["skipWeekends"] == json_bool_convert(
        original_schedule["skipWeekends"]
    )
    assert content_schedule["skipHolidays"] == json_bool_convert(
        original_schedule["skipHolidays"]
    )
