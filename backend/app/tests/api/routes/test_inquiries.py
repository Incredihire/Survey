import random
import string
import uuid

from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.tests.utils.inquiry import create_random_inquiry


def test_create_inquiry(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # pylint: disable=B311
    data = {"text": "".join(random.choice(string.printable) for _ in range(255))}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["text"] == data["text"]


def test_read_inquries(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    first_response = client.get(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
    )
    assert first_response.status_code == 200

    initial_content = first_response.json()
    initial_inquiries = initial_content["data"]
    initial_length = len(initial_inquiries)

    # Create two new inquiries
    inquiry_1 = jsonable_encoder(create_random_inquiry(db))
    inquiry_2 = jsonable_encoder(create_random_inquiry(db))

    second_response = client.get(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
    )
    assert second_response.status_code == 200

    new_content = second_response.json()
    new_inquiries = new_content["data"]
    new_length = len(new_inquiries)

    assert new_length == initial_length + 2

    # Ensure the new inquiries are included in the new response
    assert any(inquiry["id"] == inquiry_1["id"] for inquiry in new_inquiries)
    assert any(inquiry["id"] == inquiry_2["id"] for inquiry in new_inquiries)

    # Ensure the new inquiries have the correct text
    assert any(inquiry["text"] == inquiry_1["text"] for inquiry in new_inquiries)
    assert any(inquiry["text"] == inquiry_2["text"] for inquiry in new_inquiries)


def test_read_inquiry(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    inquiry = create_random_inquiry(db)
    response = client.get(
        f"{settings.API_V1_STR}/inquiries/{inquiry.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content == jsonable_encoder(inquiry)


def test_read_inquiry_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/inquiries/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Inquiry not found"
