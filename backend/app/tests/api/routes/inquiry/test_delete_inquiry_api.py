import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models.inquiry import Inquiry


@pytest.fixture(name="single_inquiry", scope="function")
def fixture_single_inquiry(db: Session) -> Inquiry:
    single_inquiry = Inquiry(text="How's your work-life balance?")
    db.add(single_inquiry)
    db.commit()
    return single_inquiry


def test_delete_request_to_inquiry_route_should_return_405_inquiry_when_inquiry_not_exists(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/inquiries/999999",
        headers=superuser_token_headers,
    )
    assert response.status_code == 400


def test_delete_request_to_inquiry_route_should_delete_inquiry_when_inquiry_exists(
    client: TestClient, superuser_token_headers: dict[str, str], single_inquiry: Inquiry
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/inquiries/{single_inquiry.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Inquiry deleted"
