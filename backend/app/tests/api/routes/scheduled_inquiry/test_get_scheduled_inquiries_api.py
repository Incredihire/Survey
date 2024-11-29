from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import Inquiry, ScheduledInquiry

path = f"{settings.API_V1_STR}/scheduledinquiries/"


def test_get_scheduled_inquiries_when_scheduled_inquiries_exist_should_return_all(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    inquiry_1 = Inquiry(text="Test inquiry 1.")
    inquiry_2 = Inquiry(text="Test inquiry 2.")

    db.add(inquiry_1)
    db.add(inquiry_2)
    db.commit()

    db.refresh(inquiry_1)
    db.refresh(inquiry_2)

    response = client.get(path, headers=superuser_token_headers)

    json = response.json()
    initial_count = json["count"]

    scheduled_inquiry_1 = ScheduledInquiry(inquiry_id=inquiry_1.id, rank=1)
    scheduled_inquiry_2 = ScheduledInquiry(inquiry_id=inquiry_2.id, rank=2)

    db.add(scheduled_inquiry_1)
    db.add(scheduled_inquiry_2)
    db.commit()

    response = client.get(path, headers=superuser_token_headers)

    json = response.json()
    new_count = json["count"]

    assert new_count == initial_count + 2


def test_get_scheduled_inquiries_when_empty_returns_empty_list(
    client: TestClient,
    superuser_token_headers: dict[str, str],
) -> None:
    response = client.get(path, headers=superuser_token_headers)

    json = response.json()

    assert len(json["data"]) == 0
    assert json["count"] == 0
