from fastapi.testclient import TestClient
from sqlmodel import Session

from .....core.config import settings
from .....tests.utils.schedule_utils import (
    assert_response_content_equals_original_object,
    create_first_schedule,
    create_second_schedule,
    first_valid_schedule,
    second_valid_schedule,
)


def test_get_schedule_when_there_is_no_schedule_should_return_none(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content is None


def test_get_schedule_when_there_is_a_schedule_should_retrieve_schedule(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_first_schedule(db)
    response = client.get(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    schedule = content["schedule"]
    assert schedule["daysBetween"] == first_valid_schedule["schedule"]["daysBetween"]
    assert schedule["endDate"] == first_valid_schedule["schedule"]["endDate"]
    assert schedule["startDate"] == first_valid_schedule["schedule"]["startDate"]
    assert schedule["timesOfDay"] == first_valid_schedule["schedule"]["timesOfDay"]
    assert not schedule["skipWeekends"]
    assert not schedule["skipHolidays"]


def test_get_schedule_when_a_schedule_has_been_added_twice_should_return_the_latest_schedule(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_first_schedule(db)
    create_second_schedule(db)
    response = client.get(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert_response_content_equals_original_object(content, second_valid_schedule)
