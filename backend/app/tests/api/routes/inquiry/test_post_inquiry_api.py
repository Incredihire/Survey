from fastapi.testclient import TestClient

from app.core.config import settings


def test_post_request_to_inquiry_route_should_create_inquiry_when_inquiry_does_not_exist(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    inquiry_text = "Why do birds suddenly appear every time you are near?"

    data = {"text": inquiry_text}
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


def test_post_request_to_inquiry_route_should_return_4xx_new_inquiry_when_inquiry_already_exists(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    inquiry_text = "Do they -- just like me -- long to be close to you?"

    # pylint: disable=B311
    data = {"text": inquiry_text}
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
    data = {"text": inquiry_text}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "This inquiry already exists."


def test_post_request_to_inquiry_route_should_return_4xx_when_no_text_is_supplied(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # pylint: disable=B311
    data: dict[str, str] = {}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert "Field required" in response.content.decode("utf-8")


def test_post_request_to_inquiry_route_should_return_4xx_when_text_is_too_short(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # pylint: disable=B311
    data = {"text": "A" * 9}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert "String should have at least 10 characters" in response.content.decode(
        "utf-8"
    )


def test_post_request_to_inquiry_route_should_return_4xx_when_text_is_too_long(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # pylint: disable=B311
    data = {"text": "A" * 257}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert "String should have at most 25" in response.content.decode("utf-8")