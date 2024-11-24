import time

import jwt

from app.core.config import settings


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
