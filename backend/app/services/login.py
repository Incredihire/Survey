from sqlmodel import Session

import app.services.users as users_service
from app.core.security import verify_password
from app.models import User


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = users_service.get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user
