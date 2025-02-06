from collections.abc import Generator

import pytest
from fastapi import HTTPException, status
from fastapi.security.utils import get_authorization_scheme_param
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

import app.services.users as users_service
from app.api.deps import AuthorizationDep, get_current_user, get_db
from app.core.config import settings
from app.core.db import init_db
from app.main import app
from app.models import Inquiry, Schedule, User


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

    def get_current_user_override(authorization: AuthorizationDep) -> User:
        scheme, token = get_authorization_scheme_param(authorization)
        user = users_service.get_user_by_email(session=db, email=token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return user

    app.dependency_overrides[get_db] = get_db_override
    app.dependency_overrides[get_current_user] = get_current_user_override
    init_db(db)
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


# Clear specified tables after running each test function
@pytest.fixture(scope="function", autouse=True)
def clear_tables_after_tests(db: Session) -> Generator[None, None, None]:
    yield
    tables_to_clear = [Inquiry, Schedule]
    for table in tables_to_clear:
        statement = select(table)
        results = db.exec(statement).all()
        for record in results:
            db.delete(record)
    db.commit()


@pytest.fixture(scope="module")
def superuser_token_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {settings.FIRST_SUPERUSER}"}


@pytest.fixture(scope="module")
def normal_user_token_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {settings.EMAIL_TEST_USER}"}
