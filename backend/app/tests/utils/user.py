from sqlmodel import Session

import app.services.users as users_service
from app.core import security


def access_token_from_email(email: str, db: Session) -> str:
    """
    Return a valid token for the user with given email.
    """
    user = users_service.get_user_by_email(session=db, email=email)
    if user:
        return security.create_access_token(user.id)
    else:
        return ""
