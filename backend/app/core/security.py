import time

import jwt

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
            "https://survey.incredihire.com/api/v1/auth/callback",
            "https://survey.incredihire.com/docs/oauth2-redirect",
            "http://localhost/",
            "http://localhost/api/v1/auth/callback",
            "http://localhost/docs/oauth2-redirect",
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


def create_access_token(email: str) -> str:
    iat = int(time.time())
    access_token = jwt.encode(
        {
            "email": email,
            "iat": iat,
            "exp": iat + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        },
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return access_token
