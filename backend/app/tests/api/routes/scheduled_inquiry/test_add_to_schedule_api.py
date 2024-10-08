from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models import Inquiry
from app.tests.utils.api_post import api_post
from app.tests.utils.utils import bad_integer_id

route_prefix = "scheduledinquiries"


def test_add_to_schedule_when_called_with_invalid_inquiry_id_returns_422(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    invalid_inquiry_id = bad_integer_id
    test_dto = {"inquiry_id": invalid_inquiry_id}

    content = api_post(
        client=client,
        headers=superuser_token_headers,
        prefix=route_prefix,
        data=test_dto,
        expected_status=422,
    )

    assert content["detail"] == "Inquiry not found"


def test_post_scheduled_inquiry_when_called_with_inquiry_id_that_exists_should_return_scheduled_inquiry(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    inquiry_1 = Inquiry(text="Testing the happy path")

    db.add(inquiry_1)
    db.commit()

    db.refresh(inquiry_1)

    test_dto = {"inquiry_id": str(inquiry_1.id)}

    content = api_post(
        client=client,
        headers=superuser_token_headers,
        prefix=route_prefix,
        data=test_dto,
        expected_status=200,
    )

    assert "inquiry_id" in str(content)
