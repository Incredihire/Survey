import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models.schedule import Schedule
from app.tests.utils.schedule_utils import first_schedule_string


@pytest.fixture(name="single_schedule", scope="function")
def fixture_single_schedule(db: Session) -> Schedule:
    single_schedule = Schedule(schedule=first_schedule_string, scheduled_inquiries="[]")
    db.add(single_schedule)
    db.commit()
    return single_schedule


def test_patch_scheduled_inquiries_request_route_should_update_when_schedule_exists(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    single_schedule: Schedule,
) -> None:
    data = [1]
    response = client.patch(
        f"{settings.API_V1_STR}/schedule/update_scheduled_inquiries",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert "schedule" in content
    assert content["id"] == single_schedule.id
    assert content["scheduled_inquiries"] == [1]
    assert "id" in content


def test_patch_scheduled_inquiries_request_route_should_fail_when_invalid_json(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = ["abc"]
    response = client.patch(
        f"{settings.API_V1_STR}/schedule/update_scheduled_inquiries",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
