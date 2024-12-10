from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import Theme
from app.models.inquiry import MAX_LENGTH, MIN_LENGTH, Inquiry


@pytest.fixture(name="single_inquiry", scope="function")
def fixture_single_inquiry(db: Session) -> Inquiry:
    single_inquiry = Inquiry(text="How's your work-life balance?")
    db.add(single_inquiry)
    db.commit()
    return single_inquiry


@pytest.fixture(name="single_theme", scope="function")
def fixture_single_theme(db: Session) -> Theme:
    single_theme = Theme(name="Category 1")
    db.add(single_theme)
    db.commit()
    return single_theme


def test_patch_text_request_to_inquiry_route_should_return_400_inquiry_when_inquiry_not_exists(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"id": 0, "text": "Bad ID Test", "theme_id": None, "first_scheduled": None}
    response = client.patch(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 400


def test_patch_text_request_to_inquiry_route_should_update_inquiry_when_inquiry_exists(
    client: TestClient, superuser_token_headers: dict[str, str], single_inquiry: Inquiry
) -> None:
    inquiry_text = f"{single_inquiry.text} - UPDATED"

    data = {
        "id": single_inquiry.id,
        "text": inquiry_text,
        "theme_id": None,
        "first_scheduled": None,
    }
    response = client.patch(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["text"] == data["text"]
    assert "id" in content
    assert "created_at" in content


def test_patch_theme_id_request_to_inquiry_route_should_update_inquiry_when_inquiry_exists(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    single_inquiry: Inquiry,
    single_theme: Theme,
) -> None:
    data = {
        "id": single_inquiry.id,
        "text": single_inquiry.text,
        "theme_id": single_theme.id,
        "first_scheduled": None,
    }
    response = client.patch(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["theme_id"] == data["theme_id"]
    assert "id" in content
    assert "created_at" in content


def test_patch_first_scheduled_request_to_inquiry_route_should_update_inquiry_when_inquiry_exists(
    client: TestClient, superuser_token_headers: dict[str, str], single_inquiry: Inquiry
) -> None:
    data = {
        "id": single_inquiry.id,
        "text": single_inquiry.text,
        "theme_id": single_inquiry.theme_id,
        "first_scheduled": str(datetime.now()),
    }
    response = client.patch(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["theme_id"] == data["theme_id"]
    assert "id" in content
    assert "created_at" in content


def test_patch_request_to_inquiry_route_should_return_422_when_no_text_is_supplied(
    client: TestClient, superuser_token_headers: dict[str, str], single_inquiry: Inquiry
) -> None:
    data = {"id": single_inquiry.id, "theme_id": None, "first_scheduled": None}
    response = client.patch(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert "Field required" in response.content.decode("utf-8")


def test_patch_request_to_inquiry_route_should_return_422_when_text_is_too_short(
    client: TestClient, superuser_token_headers: dict[str, str], single_inquiry: Inquiry
) -> None:
    data = {
        "id": single_inquiry.id,
        "text": "A" * (MIN_LENGTH - 1),
        "theme_id": None,
        "first_scheduled": None,
    }
    response = client.patch(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert (
        f"String should have at least {MIN_LENGTH} characters"
        in response.content.decode("utf-8")
    )


def test_patch_request_to_inquiry_route_should_return_422_when_text_is_too_long(
    client: TestClient, superuser_token_headers: dict[str, str], single_inquiry: Inquiry
) -> None:
    data = {
        "id": single_inquiry.id,
        "text": "A" * (MAX_LENGTH + 1),
        "theme_id": None,
        "first_scheduled": None,
    }
    response = client.patch(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert (
        f"String should have at most {MAX_LENGTH} characters"
        in response.content.decode("utf-8")
    )
