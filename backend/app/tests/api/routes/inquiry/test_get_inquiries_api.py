import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import Inquiry


@pytest.fixture(name="two_hundred_inquiries", scope="function")
def fixture_two_hundred_inquiries(db: Session) -> list[Inquiry]:
    inquiry_texts = [f"Inquiry #{i + 1}" for i in range(200)]
    inquiries = [Inquiry(text=text) for text in inquiry_texts]
    db.add_all(inquiries)
    db.commit()
    return inquiries


def test_getInquiriesAPI_whenCalledWithoutSkipAndLimit_shouldReturnInquiries(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    two_hundred_inquiries: list[Inquiry],
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/inquiries",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["count"] == len(two_hundred_inquiries)
    assert len(content["data"]) == 100


def test_getInquiriesAPI_whenCalledWithValidSkip_shouldReturnInquiries(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    two_hundred_inquiries: list[Inquiry],
) -> None:
    skip = 50
    response = client.get(
        f"{settings.API_V1_STR}/inquiries?skip={skip}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["count"] == len(two_hundred_inquiries)
    assert len(content["data"]) == 100


def test_getInquiriesAPI_whenCalledWithValidLimit_shouldReturnInquiries(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    two_hundred_inquiries: list[Inquiry],
) -> None:
    limit = 50
    response = client.get(
        f"{settings.API_V1_STR}/inquiries?limit={limit}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["count"] == len(two_hundred_inquiries)
    assert len(content["data"]) == 50


def test_getInquiriesAPI_whenCalledwithInvalidSkip_shouldReturnBadRequest(
    client: TestClient,
    superuser_token_headers: dict[str, str],
) -> None:
    invalid_params = [
        {"skip": -1, "limit": 10},
        {"skip": -1, "limit": -1},
    ]
    for params in invalid_params:
        response = client.get(
            f"{settings.API_V1_STR}/inquiries?skip={params['skip']}&limit={params['limit']}",
            headers=superuser_token_headers,
        )
        assert response.status_code == 400
        content = response.json()
        assert content["detail"] == "Invalid value for 'skip': it must be non-negative"


def test_getInquiriesAPI_whenCalledwithInvalidLimit_shouldReturnBadRequest(
    client: TestClient,
    superuser_token_headers: dict[str, str],
) -> None:
    invalid_params = [
        {"skip": 10, "limit": -1},
        {"skip": -1, "limit": -1},
    ]
    for params in invalid_params:
        response = client.get(
            f"{settings.API_V1_STR}/inquiries?skip={params['skip']}&limit={params['limit']}",
            headers=superuser_token_headers,
        )
        assert response.status_code == 400
        content = response.json()
        if (
            params["skip"] < 0
        ):  # skip error message is handled first if both params are invalid
            assert (
                content["detail"] == "Invalid value for 'skip': it must be non-negative"
            )
        else:
            assert (
                content["detail"]
                == "Invalid value for 'limit': it must be non-negative"
            )
