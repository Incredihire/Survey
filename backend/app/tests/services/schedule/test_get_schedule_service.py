from sqlmodel import Session

from app.services.schedule import get_schedule
from app.tests.utils.schedule_utils import (
    create_first_schedule,
    create_second_schedule,
    first_schedule_string,
    second_schedule_string,
)


def test_get_schedule_service_when_schedule_does_exist_should_return_none(
    db: Session,
) -> None:
    result = get_schedule(session=db)
    assert result is None


def test_get_schedule_service_when_schedule_exists_should_return_schedule_entity(
    db: Session,
) -> None:
    create_first_schedule(db)
    result = get_schedule(session=db)
    assert result
    assert result.id
    assert result.schedule == first_schedule_string


def test_get_schedule_service_when_two_schedules_added_exists_should_return_latest_schedule(
    db: Session,
) -> None:
    create_first_schedule(db)
    result = get_schedule(session=db)
    assert result
    first_id = result.id
    assert result.schedule == first_schedule_string
    create_second_schedule(db)
    result = get_schedule(session=db)
    assert result
    assert result.id == first_id
    assert result.schedule == second_schedule_string
