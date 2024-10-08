import re

from fastapi.testclient import TestClient

from .....core.config import settings
from .....tests.utils.schedule_utils import (
    assert_response_content_equals_original_object,
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
    assert_response_content_equals_original_object(content, first_valid_schedule)


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
    assert_response_content_equals_original_object(content, second_valid_schedule)


def test_create_schedule_when_schedule_is_missing_an_attribute_should_return_error(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=schedule_with_missing_attribute,
    )
    assert response.status_code == 422
    assert re.search("Schedule input is not valid", response.content.decode("utf-8"))


def test_create_schedule_when_time_is_malformed_should_return_error(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=schedule_with_bad_time,
    )
    assert response.status_code == 422
    assert re.search("Schedule input is not valid", response.content.decode("utf-8"))


def test_create_schedule_when_date_is_malformed_should_return_error(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/schedule/",
        headers=superuser_token_headers,
        json=schedule_with_bad_date,
    )
    assert response.status_code == 422
    assert re.search("Schedule input is not valid", response.content.decode("utf-8"))


def test_create_schedule_when_data_is_not_a_schedule_string_should_return_error(
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
