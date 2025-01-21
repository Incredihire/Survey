from datetime import timedelta

from fastapi_jwt import (
    JwtAccessBearerCookie,
)
from passlib.context import CryptContext

from app.core.config import settings

GOOGLE_CLIENT_CONFIG = {
    "web": {
        "client_id": f"{settings.GOOGLE_CLIENT_ID}",
        "project_id": "survey-incredihire",
        "auth_uri": f"{settings.GOOGLE_AUTHORIZATION_URL}",
        "token_uri": f"{settings.GOOGLE_TOKEN_URL}",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": f"{settings.GOOGLE_CLIENT_SECRET}",
        "redirect_uris": [
            "https://survey.incredihire.com",
            "https://survey-api.incredihire.com/api/v1/auth/callback",
            "https://survey-api.incredihire.com/docs/oauth2-redirect",
            "http://localhost/",
            "http://localhost/api/v1/auth/callback",
            "http://localhost/docs/oauth2-redirect",
            "http://local.jeremewillig.com/api/v1/auth/callback",
        ],
        "javascript_origins": [
            "https://localhost:8000",
            "https://survey.incredihire.com",
            "https://localhost",
        ],
    }
}

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

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
