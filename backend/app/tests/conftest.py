from collections.abc import Generator

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from app.api.deps import get_db
from app.core.config import settings
from app.core.db import init_db
from app.main import app
from app.models import Inquiry, Schedule


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
    tables_to_clear = [Inquiry, Schedule]
    for table in tables_to_clear:
        statement = select(table)
        results = db.exec(statement).all()
        for record in results:
            db.delete(record)
    db.commit()


@pytest.fixture(scope="module")
def superuser_token_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {jwt.encode({"email": settings.FIRST_SUPERUSER}, settings.JWT_SECRET_KEY, algorithm="HS256")}"
    }


@pytest.fixture(scope="module")
def normal_user_token_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {jwt.encode({"email": settings.EMAIL_TEST_USER}, settings.JWT_SECRET_KEY, algorithm="HS256")}"
    }
