from sqlmodel import Session

from app.models import ScheduleCreate
from app.services.schedule import create_schedule
from app.tests.utils.schedule_utils import (
    first_schedule_string,
    first_valid_schedule,
    second_schedule_string,
    second_valid_schedule,
)


def test_create_schedule_service_when_schedule_does_exist_should_create_schedule(
    db: Session,
) -> None:
    result = create_schedule(
        session=db, schedule_in=ScheduleCreate.model_validate(first_valid_schedule)
    )
    assert result.id is not None
    assert result.schedule == first_schedule_string


def test_create_schedule_service_when_schedule_already_exists_should_create_schedule(
    db: Session,
) -> None:
    create_schedule(
        session=db, schedule_in=ScheduleCreate.model_validate(first_valid_schedule)
    )
    result = create_schedule(
        session=db, schedule_in=ScheduleCreate.model_validate(second_valid_schedule)
    )
    assert result.id is not None
    assert result.schedule == second_schedule_string
