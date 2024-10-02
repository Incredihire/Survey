from sqlmodel import Session

from app.models import ScheduleCreate
from app.services.schedule import create_schedule

first_schedule_string = '{"startDate":"2024-10-02","endDate":"2024-11-01","daysBetween":1,"skipWeekends":false,"skipHolidays":false,"timesOfDay":["08:00"]}'
second_schedule_string = '{"startDate":"2024-12-12","endDate":"2024-12-22","daysBetween":1,"skipWeekends":true,"skipHolidays":true,"timesOfDay":["18:00"]}'

first_valid_schedule = {
    "schedule": {
        "startDate": "2024-10-02",
        "endDate": "2024-11-01",
        "daysBetween": 1,
        "skipWeekends": "false",
        "skipHolidays": "false",
        "timesOfDay": ["08:00"],
    }
}

second_valid_schedule = {
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
