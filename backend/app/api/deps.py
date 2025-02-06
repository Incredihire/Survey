import logging
from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security.utils import get_authorization_scheme_param
from sqlmodel import Session

import app.services.users as users_service
from app.core.config import settings
from app.core.db import engine
from app.core.security import algorithms, jwks, oidc_auth
from app.models import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
AuthorizationDep = Annotated[str, Depends(oidc_auth)]


def get_current_user(session: SessionDep, authorization: AuthorizationDep) -> User:
    scheme, token = get_authorization_scheme_param(authorization)
    if not authorization or scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    attempt = 0
    payload = None
    while payload is None and attempt < len(jwks["keys"]):
        try:
            payload = jwt.decode(
                jwt=token,
                key=jwt.PyJWK(jwk_data=jwks["keys"][attempt]),
                algorithms=algorithms,
                audience=settings.OIDC_CLIENT_ID,
                options={"verify_signature": True},
            )
            if payload is not None:
                attempt += 1
                logger.info(f"Attempt #{attempt} to decode JWT token was successful.")
        except Exception as e:
            attempt += 1
            logger.error(f"Failed attempt #{attempt} to decode JWT token: {e}")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = users_service.get_user_by_email(session=session, email=payload.get("email"))
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
