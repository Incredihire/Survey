from typing import Any

from fastapi.testclient import TestClient

from app.core.config import settings


def post_theme(
    client: TestClient,
    headers: dict[str, str],
    data: dict[str, Any],
    expected_status: int | None = None,
) -> dict[str, Any]:
    response = client.post(f"{settings.API_V1_STR}/themes/", headers=headers, json=data)

    if expected_status is not None:
        assert response.status_code == expected_status

    content: dict[str, Any] = response.json()

    return content
