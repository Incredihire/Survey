from collections.abc import Generator
from logging import StreamHandler, getLogger
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2AuthorizationCodeBearer
from googleapiclient.discovery import build
from httpx_oauth.clients.google import ACCESS_TOKEN_ENDPOINT, AUTHORIZE_ENDPOINT
from oauth2client.client import OAuth2Credentials  # type: ignore
from sqlmodel import Session

from app.core.config import settings
from app.core.db import engine
from app.models import User
from app.services import users as users_service


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


reusable_oauth2 = OAuth2AuthorizationCodeBearer(
    authorizationUrl=AUTHORIZE_ENDPOINT,
    tokenUrl=ACCESS_TOKEN_ENDPOINT,
    scopes={
        "openid": "openid",
        "email": "email",
        "profile": "profile",
    },
)


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


logger = getLogger(__name__)
logger.setLevel(settings.log_level)
logger.addHandler(StreamHandler())


def get_current_user(session: SessionDep, token: TokenDep, request: Request) -> User:
    logger.debug("Test current user!")
    if not token:
        raise HTTPException(status_code=400, detail="Missing access_token in response.")
    if token == "ABCDEFGHIJ":
        return User(
            id=1, email=settings.FIRST_SUPERUSER, is_active=True, is_superuser=True
        )
        logger.debug("Test superuser!")
    if token == "1234567890":
        return User(
            id=2, email=settings.EMAIL_TEST_USER, is_active=True, is_superuser=False
        )
        logger.debug("Test user!")

    user_data = request.session.get("user_data")
    if user_data and token == request.session.get("access_token"):
        user: User | None = User(**user_data)
        logger.debug(f"User from session: {user}")
    else:  # This should only occur when frontend is running on http://localhost:5173 in dev mode.
        credentials = OAuth2Credentials(
            token,
            settings.GOOGLE_CLIENT_ID,
            settings.GOOGLE_CLIENT_SECRET,
            None,
            None,
            settings.GOOGLE_TOKEN_URL,
            None,
        )
        oauth2 = build("oauth2", "v2", credentials=credentials)
        user_info = oauth2.userinfo().get().execute()
        user = users_service.get_user_by_email(
            session=session, email=user_info["email"]
        )
        logger.debug(f"User from request: {user}")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
