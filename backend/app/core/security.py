from datetime import timedelta

from fastapi_jwt import (
    JwtAccessBearerCookie,
)
from passlib.context import CryptContext

from app.core.config import settings

access_security = JwtAccessBearerCookie(
    secret_key=settings.JWT_SECRET_KEY,
    auto_error=False,
    access_expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    refresh_expires_delta=timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES),
    algorithm=settings.JWT_ALGORITHM,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
