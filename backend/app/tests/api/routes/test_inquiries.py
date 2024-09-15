import random
import string

from fastapi.testclient import TestClient

from app.core.config import settings

def test_create_item(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"text": "".join(random.choice(string.printable) for _ in range(255))}
    response = client.post(
        f"{settings.API_V1_STR}/inquiries/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["text"] == data["text"]

