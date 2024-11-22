from passlib.context import CryptContext
from sqlmodel import Session, select

from app.models import (
    User,
    UserCreate,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": pwd_context.hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user
