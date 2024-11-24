import base64
import hashlib
import os
from urllib.parse import urlparse, urlunparse

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from google.auth.transport import requests
from google.oauth2.credentials import Credentials
from google.oauth2.id_token import verify_oauth2_token
from google_auth_oauthlib.flow import Flow  # type: ignore [import-untyped]

import app.services.users as users_service
from app.api.deps import SessionDep
from app.core.config import settings
from app.core.security import create_access_token

load_dotenv()

router = APIRouter()

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

local_dev_auth = settings.DOMAIN == "localhost" and settings.ENVIRONMENT == "local"
if local_dev_auth:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"


def generate_code_verifier() -> str:
    """Generates a random code verifier for PKCE."""
    verifier = base64.urlsafe_b64encode(os.urandom(30)).decode("utf-8").rstrip("=")
    return verifier


def generate_code_challenge(code_verifier: str) -> str:
    """Creates the code challenge by hashing the code verifier using SHA-256."""
    encoded_verifier = code_verifier.encode("utf-8")
    digest = hashlib.sha256(encoded_verifier).digest()
    code_challenge = base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")
    return code_challenge


@router.get("/login")
async def login(request: Request) -> RedirectResponse:
    referer_parsed = urlparse(request.headers.get("Referer"))
    if (
        not referer_parsed.scheme
        or not referer_parsed.netloc
        or referer_parsed.netloc != settings.DOMAIN
    ):
        raise HTTPException(status_code=400, detail="Invalid referrer")
    return_url = urlunparse(components=referer_parsed)
    if isinstance(return_url, bytes):
        return_url = return_url.decode()

    flow = Flow.from_client_config(
        GOOGLE_CLIENT_CONFIG,
        SCOPES,
        redirect_uri=request.url_for("auth_callback"),
        pkce="S256",
    )
    google_auth_url, state = flow.authorization_url()
    response = RedirectResponse(url=google_auth_url)
    response.set_cookie(
        "auth_return_url",
        return_url,
        secure=(not local_dev_auth),
        httponly=(not local_dev_auth),
    )

    response.set_cookie(
        "auth_state",
        state,
        secure=(not local_dev_auth),
        httponly=(not local_dev_auth),
    )
    response.set_cookie(
        "auth_code_verifier",
        flow.oauth2session._code_verifier,
        secure=(not local_dev_auth),
        httponly=(not local_dev_auth),
    )
    return response


@router.get("/callback")
async def auth_callback(
    session: SessionDep, code: str, state: str, request: Request
) -> RedirectResponse:
    if state != request.cookies.get("auth_state"):
        raise HTTPException(status_code=400, detail="Invalid state")
    flow = Flow.from_client_config(
        GOOGLE_CLIENT_CONFIG,
        SCOPES,
        redirect_uri=request.url_for("auth_callback"),
        code_verifier=request.cookies.get("auth_code_verifier"),
    )

    token_response = flow.fetch_token(code=code, access_type="offline")
    refresh_token = token_response.get("refresh_token")
    credentials: Credentials = flow.credentials
    if not credentials.id_token:
        raise HTTPException(status_code=400, detail="Missing id_token in response.")
    try:
        id_token = verify_oauth2_token(credentials.id_token, requests.Request())  # type: ignore [no-untyped-call]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid id_token: {str(e)}")

    email = id_token.get("email")
    user = users_service.get_user_by_email(session=session, email=email)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user.")

    return_url = request.cookies.get("auth_return_url")
    if not return_url:
        raise HTTPException(status_code=400, detail="Missing return_url.")
    return_url_parsed = urlparse(return_url)
    if (
        not return_url_parsed.scheme
        or not return_url_parsed.netloc
        or return_url_parsed.netloc != settings.DOMAIN
    ):
        raise HTTPException(status_code=400, detail="Invalid return_url.")
    response = RedirectResponse(url=return_url)
    access_token_jwt = create_access_token(email=email)
    response.set_cookie(
        "access_token",
        access_token_jwt,
        secure=(not local_dev_auth),
        httponly=(not local_dev_auth),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    if not refresh_token:
        refresh_token = request.cookies.get(
            "refresh_token"
        )  # extend refresh_token cookie expiration. google refresh tokens don't expire. you must revoke them.

    if refresh_token:
        response.set_cookie(
            "refresh_token",
            refresh_token,
            secure=(not local_dev_auth),
            httponly=(not local_dev_auth),
            max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
            path="/api/v1/auth/refresh",
        )
    return response


@router.post("/refresh")
async def refresh(session: SessionDep, request: Request) -> JSONResponse:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Missing refresh_token.")
    data = {
        "refresh_token": refresh_token,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "grant_type": "refresh_token",
    }
    async with httpx.AsyncClient() as client:
        client_response = await client.post(settings.GOOGLE_TOKEN_URL, data=data)
        client_response.raise_for_status()
        token_response = client_response.json()
    id_token_jwt = token_response.get("id_token")
    if not id_token_jwt:
        raise HTTPException(status_code=400, detail="Missing id_token in response.")
    try:
        id_token = verify_oauth2_token(id_token_jwt, request=requests.Request())  # type: ignore [no-untyped-call]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid id_token: {str(e)}")

    email = id_token.get("email")
    user = users_service.get_user_by_email(session=session, email=email)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    referer_parsed = urlparse(request.headers.get("Referer"))
    if (
        not referer_parsed.scheme
        or not referer_parsed.netloc
        or referer_parsed.netloc != settings.DOMAIN
    ):
        raise HTTPException(status_code=400, detail="Invalid referrer")
    return_url = urlunparse(components=referer_parsed)
    if isinstance(return_url, bytes):
        return_url = return_url.decode()
    response = JSONResponse({"status": "success"})
    access_token_jwt = create_access_token(email)
    response.set_cookie(
        "access_token",
        access_token_jwt,
        secure=(not local_dev_auth),
        httponly=(not local_dev_auth),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return response
