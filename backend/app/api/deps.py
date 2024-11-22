from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from httpx_oauth.clients.google import ACCESS_TOKEN_ENDPOINT, AUTHORIZE_ENDPOINT
from sqlmodel import Session

import app.services.users as users_service
from app.core.config import settings
from app.core.db import engine
from app.models import User


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


class CookieOAuth2AuthorizationCodeBearer(OAuth2AuthorizationCodeBearer):
    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get("access_token")
        if not token:
            authorization_header = request.headers.get("Authorization")
            if authorization_header and authorization_header.startswith("Bearer "):
                token = authorization_header.split("Bearer ")[1]
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        return token


reusable_oauth2 = CookieOAuth2AuthorizationCodeBearer(
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


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    jwt_token = jwt.decode(
        token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
    )
    email = jwt_token.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid access_token")

    user = users_service.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
