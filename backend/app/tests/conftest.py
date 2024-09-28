import uuid
from collections.abc import Generator

import jwt
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from jwt import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from starlette import status

from app.api.deps import SessionDep, TokenDep, get_current_user, get_db
from app.core import security
from app.core.config import settings
from app.core.db import init_db
from app.main import app
from app.models import Inquiry, TokenPayload, User
from app.tests.utils.user import authentication_token_from_email
from app.tests.utils.utils import get_superuser_token_headers


@pytest.fixture(name="db", scope="session")
def session_fixture() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client", scope="session")
def client_fixture(db: Session) -> Generator[TestClient, None, None]:
    def get_db_override() -> Session:
        return db

    app.dependency_overrides[get_db] = get_db_override
    init_db(db)
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


# Clear specified tables after running each test function
@pytest.fixture(scope="function", autouse=True)
def clear_tables_after_tests(db: Session) -> Generator[None, None, None]:
    yield
    tables_to_clear = [Inquiry]
    for table in tables_to_clear:
        statement = select(table)
        results = db.exec(statement).all()
        for record in results:
            db.delete(record)
    db.commit()


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )


# sqlite does not have a native UUID type but our users do so we need to override get_current_user
def get_current_user_force_uuid(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, uuid.UUID(token_data.sub))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


app.dependency_overrides[get_current_user] = get_current_user_force_uuid
