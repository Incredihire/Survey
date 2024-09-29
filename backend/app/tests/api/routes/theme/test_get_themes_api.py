import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models.theme import ThemeCreate
from app.services.themes import create_theme


def test_get_themes_when_themes_exist_should_return_all_themes(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    initial_response = client.get(
        f"{settings.API_V1_STR}/themes/",
        headers=superuser_token_headers,
    )
    assert initial_response.status_code == 200

    initial_content = initial_response.json()
    initial_themes = initial_content["data"]
    initial_length = len(initial_themes)

    # Create two new themes
    theme_data_1 = ThemeCreate(
        name="Theme One", description="Description for Theme One."
    )
    theme_data_2 = ThemeCreate(
        name="Theme Two", description="Description for Theme Two."
    )

    created_theme_1 = create_theme(session=db, theme_in=theme_data_1)
    created_theme_2 = create_theme(session=db, theme_in=theme_data_2)

    # Getting these themes
    second_response = client.get(
        f"{settings.API_V1_STR}/themes/",
        headers=superuser_token_headers,
    )
    assert second_response.status_code == 200

    new_content = second_response.json()
    new_themes = new_content["data"]
    new_length = len(new_themes)

    assert new_length == initial_length + 2
    assert any(theme["id"] == str(created_theme_1.id) for theme in new_themes)
    assert any(theme["id"] == str(created_theme_2.id) for theme in new_themes)


def test_get_theme_by_id_when_theme_exists_should_retrieve_theme(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    # Create a new theme
    theme_data = ThemeCreate(name="Specific Theme", description="Specific description.")
    created_theme = create_theme(session=db, theme_in=theme_data)

    # Getting this theme
    response = client.get(
        f"{settings.API_V1_STR}/themes/{created_theme.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()

    assert content["id"] == str(created_theme.id)
    assert content["name"] == created_theme.name
    assert content["description"] == created_theme.description


def test_get_theme_by_id_when_theme_does_not_exist_should_return_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    non_existent_id = uuid.uuid4()
    response = client.get(
        f"{settings.API_V1_STR}/themes/{non_existent_id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Theme not found"
