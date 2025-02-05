from fastapi_third_party_auth import (  # type: ignore[import-untyped]
    Auth,
    GrantType,
    IDToken,
)

from app.core.config import settings

auth = Auth(
    openid_connect_url=settings.OPENID_CONNECT_URL,
    issuer=settings.OIDC_ISSUER,
    client_id=settings.OIDC_CLIENT_ID,
    grant_types=[GrantType.IMPLICIT],
    idtoken_model=IDToken,
)
