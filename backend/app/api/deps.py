import logging
from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from google.auth.transport import requests
from google.oauth2 import id_token
from googleapiclient.discovery import build
from jwt.exceptions import InvalidTokenError
from oauth2client.client import OAuth2Credentials
from pydantic import ValidationError
from sqlmodel import Session

import app.services.users as users_service
from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.models import TokenPayload, User

logger = logging.getLogger(__name__)
logger.setLevel(settings.log_level)
logger.addHandler(logging.StreamHandler())


reusable_oauth2 = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.GOOGLE_AUTHORIZATION_URL,
    tokenUrl=settings.GOOGLE_TOKEN_URL,
    scopes={
        "openid": "openid",
        "email": "email",
        "profile": "profile",
    },
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep, request: Request) -> User:
    if not token:
        raise HTTPException(status_code=400, detail="Missing access_token in response.")
    if request.session.get("email") and request.session.get("access_token") == token:
        user_dict = request.session.get("user_dict")
        if user_dict:
            user = User(**user_dict)
            logger.debug(f"User from session: {user}")
        else:
            user = users_service.get_user_by_email(
                session=session, email=request.session.get("email")
            )
            request.session["user_dict"] = user.dict()
            logger.debug(f"User to session: {user}")
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
