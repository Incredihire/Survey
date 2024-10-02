import re

from fastapi.testclient import TestClient

from app.core.config import settings
from app.tests.utils.schedule_utils import (
    first_valid_schedule,
    not_a_schedule_string,
    schedule_with_bad_date,
    schedule_with_bad_time,
    schedule_with_missing_attribute,
    second_valid_schedule,
)


def test_create_schedule_when_there_is_no_schedule_should_make_new_schedule(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=first_valid_schedule,
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


def test_create_schedule_when_there_is_already_a_schedule_should_return_the_new_schedule(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=first_valid_schedule,
    )
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=second_valid_schedule,
    )
    assert response.status_code == 200
    content = response.json()
    schedule = content["schedule"]
    assert schedule["daysBetween"] == second_valid_schedule["schedule"]["daysBetween"]
    assert schedule["endDate"] == second_valid_schedule["schedule"]["endDate"]
    assert schedule["startDate"] == second_valid_schedule["schedule"]["startDate"]
    assert schedule["timesOfDay"] == second_valid_schedule["schedule"]["timesOfDay"]
    assert schedule["skipWeekends"]
    assert schedule["skipHolidays"]


def test_create_schedule_when_time_is_malformed_should_return_error(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=schedule_with_missing_attribute,
    )
    assert response.status_code == 422
    assert re.search("Schedule input is not valid", response.content.decode("utf-8"))


def test2_create_schedule_when_time_is_malformed_should_return_error(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=schedule_with_bad_time,
    )
    assert response.status_code == 422
    assert re.search("Schedule input is not valid", response.content.decode("utf-8"))


def test3_create_schedule_when_time_is_malformed_should_return_error(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=schedule_with_bad_date,
    )
    assert response.status_code == 422
    assert re.search("Schedule input is not valid", response.content.decode("utf-8"))


def test4_create_schedule_when_time_is_malformed_should_return_error(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=not_a_schedule_string,
    )
    assert response.status_code == 422
    assert re.search(
        "Input should be a valid dictionary or object to extract fields from",
        response.content.decode("utf-8"),
    )
