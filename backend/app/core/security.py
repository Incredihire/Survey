from typing import Any

import requests
from fastapi.security import OpenIdConnect

from app.core.config import settings

oidc_auth = OpenIdConnect(openIdConnectUrl=settings.OPENID_CONNECT_URL)


def _fetch_well_known() -> dict[str, Any]:
    url = f"{settings.OIDC_ISSUER}/.well-known/openid-configuration"
    with requests.get(url, timeout=30) as response:
        if response.status_code != 200:
            raise RuntimeError("fail to fetch well-known")
        well_known: dict[str, Any] = response.json()
        return well_known


_well_known_doc = _fetch_well_known()
authorization_endpoint: str = _well_known_doc["authorization_endpoint"]
token_endpoint: str = _well_known_doc["token_endpoint"]
algorithms: list[str] = _well_known_doc["id_token_signing_alg_values_supported"]


def _fetch_jwks() -> dict[str, Any]:
    url = _well_known_doc["jwks_uri"]
    with requests.get(url, timeout=30) as response:
        if response.status_code != 200:
            raise RuntimeError("fail to fetch jwks")
        _jwks: dict[str, Any] = response.json()
        return _jwks


jwks = _fetch_jwks()
