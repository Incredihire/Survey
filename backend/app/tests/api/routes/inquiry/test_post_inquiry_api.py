from fastapi.testclient import TestClient

from app.core.config import settings
from app.models.inquiry import MAX_LENGTH, MIN_LENGTH


def test_post_request_to_inquiry_route_should_create_inquiry_when_inquiry_does_not_exist(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    inquiry_text = "Why do birds suddenly appear every time you are near?"

    data = {"text": inquiry_text, "theme_id": None, "first_scheduled": None}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["text"] == data["text"]
    assert "id" in content
    assert "created_at" in content


def test_post_request_to_inquiry_route_should_return_400_new_inquiry_when_inquiry_already_exists(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    inquiry_text = "Do they -- just like me -- long to be close to you?"

    data = {"text": inquiry_text, "theme_id": None, "first_scheduled": None}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["text"] == data["text"]
    assert "id" in content
    assert "created_at" in content

    # same request
    data = {"text": inquiry_text, "theme_id": None, "first_scheduled": None}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "This inquiry already exists."


def test_post_request_to_inquiry_route_should_return_422_when_no_text_is_supplied(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data: dict[str, str] = {}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert "Field required" in response.content.decode("utf-8")


def test_post_request_to_inquiry_route_should_return_422_when_text_is_too_short(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"text": "A" * (MIN_LENGTH - 1)}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert (
        f"String should have at least {MIN_LENGTH} characters"
        in response.content.decode("utf-8")
    )


def test_post_request_to_inquiry_route_should_return_422_when_text_is_too_long(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"text": "A" * (MAX_LENGTH + 1)}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert (
        f"String should have at most {MAX_LENGTH} characters"
        in response.content.decode("utf-8")
    )
