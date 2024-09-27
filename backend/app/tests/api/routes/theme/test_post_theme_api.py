from fastapi.testclient import TestClient

from app.core.config import settings
from app.models.theme import MAX_NAME_LENGTH, MIN_NAME_LENGTH


def test_post_request_to_theme_route_should_create_theme_when_theme_does_not_exist(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    theme_name = "Leadership"
    description = "Focus on qualities of leadership, such as guidance, influence, vision, and the ability to inspire and empower others."

    data = {"name": theme_name, "description": description}
    response = client.post(
        f"{settings.API_V1_STR}/themes/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["description"] == data["description"]
    assert "id" in content


def test_post_request_to_theme_route_should_return_4xx_when_theme_already_exists(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    theme_name = "Management"
    description = "Organizing, planning, and overseeing tasks, projects, or teams."

    data = {"name": theme_name, "description": description}
    response = client.post(
        f"{settings.API_V1_STR}/themes/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200

    response = client.post(
        f"{settings.API_V1_STR}/themes/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "This theme already exists."


def test_post_request_to_theme_route_should_return_4xx_when_no_name_is_supplied(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"description": "No name supplied."}
    response = client.post(
        f"{settings.API_V1_STR}/themes/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert "Field required" in response.content.decode("utf-8")


def test_post_request_to_theme_route_should_return_4xx_when_name_is_too_short(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": ""}
    response = client.post(
        f"{settings.API_V1_STR}/themes/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert (
        f"String should have at least {MIN_NAME_LENGTH} character"
        in response.content.decode("utf-8")
    )


def test_post_request_to_theme_route_should_return_4xx_when_name_is_too_long(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": "A" * (MAX_NAME_LENGTH + 1)}
    response = client.post(
        f"{settings.API_V1_STR}/themes/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 422
    assert (
        f"String should have at most {MAX_NAME_LENGTH} characters"
        in response.content.decode("utf-8")
    )
