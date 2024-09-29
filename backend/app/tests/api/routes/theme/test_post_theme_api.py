from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.models.theme import MAX_NAME_LENGTH, MIN_NAME_LENGTH
from app.tests.utils.theme import post_theme


def test_post_theme_when_theme_does_not_exist_should_create_theme(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "name": "Leadership",
        "description": "Focus on qualities of leadership, such as guidance, influence, vision, and the ability to inspire and empower others.",
    }
    content = post_theme(client, superuser_token_headers, data, expected_status=200)

    assert content["name"] == data["name"]
    assert content["description"] == data["description"]
    assert "id" in content


def test_post_theme_when_theme_exists_should_return_400(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "name": "Management",
        "description": "Organizing, planning, and overseeing tasks, projects, or teams.",
    }

    # First creation should succeed
    post_theme(client, superuser_token_headers, data, expected_status=200)

    # Second creation should fail
    content = post_theme(client, superuser_token_headers, data, expected_status=400)

    assert content["detail"] == "This theme already exists."


@pytest.mark.parametrize(
    "data, expected_error",
    [
        (
            {"description": "No name supplied."},
            "Field required",
        ),
        (
            {"name": "", "description": "Name is too short."},
            f"String should have at least {MIN_NAME_LENGTH} character",
        ),
        (
            {"name": "A" * (MAX_NAME_LENGTH + 1), "description": "Name is too long."},
            f"String should have at most {MAX_NAME_LENGTH} characters",
        ),
    ],
)
def test_post_theme_when_invalid_inputs_should_return_422(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    data: dict[str, Any],
    expected_error: str,
) -> None:
    content = post_theme(client, superuser_token_headers, data, expected_status=422)

    response_text = str(content)

    assert expected_error in response_text
