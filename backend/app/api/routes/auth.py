import os
from urllib.parse import urlparse, urlunparse

import httpx
import tldextract
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

LOCAL_DEV_AUTH = settings.DOMAIN == "localhost" and settings.ENVIRONMENT == "local"
if LOCAL_DEV_AUTH:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

COOKIE_SECURE = not LOCAL_DEV_AUTH
COOKIE_HTTPONLY = not LOCAL_DEV_AUTH


def get_root_domain(domain: str) -> str:
    if LOCAL_DEV_AUTH:
        return "localhost"
    extracted = tldextract.extract(domain)
    root_domain = f"{extracted.domain}.{extracted.suffix}"
    return root_domain


COOKIE_DOMAIN = get_root_domain(settings.DOMAIN)


def check_return_url(url: str | None) -> str | None:
    return_url = None
    if url:
        return_url_parsed = urlparse(url)
        if (
            return_url_parsed.scheme
            and return_url_parsed.netloc
            and get_root_domain(return_url_parsed.netloc)
            == get_root_domain(settings.DOMAIN)
        ):
            return_url = urlunparse(components=return_url_parsed)
            if isinstance(return_url, bytes):
                return_url = return_url.decode()
    return return_url


@router.get("/login")
async def login(request: Request) -> RedirectResponse:
    flow = Flow.from_client_config(
        GOOGLE_CLIENT_CONFIG,
        SCOPES,
        redirect_uri=request.url_for("auth_callback"),
        autogenerate_code_verifier=True,
    )
    google_auth_url, state = flow.authorization_url()
    response = RedirectResponse(google_auth_url)
    return_url = check_return_url(request.headers.get("Referer"))
    callback_path = "/api/v1/auth/callback"
    if return_url:
        response.set_cookie(
            "auth_return_url",
            return_url,
            secure=COOKIE_SECURE,
            httponly=COOKIE_HTTPONLY,
            domain=COOKIE_DOMAIN,
            path=callback_path,
        )
    response.set_cookie(
        "auth_state",
        state,
        secure=COOKIE_SECURE,
        httponly=COOKIE_HTTPONLY,
        domain=COOKIE_DOMAIN,
        path=callback_path,
    )
    if flow.code_verifier:
        response.set_cookie(
            "auth_code_verifier",
            flow.code_verifier,
            secure=COOKIE_SECURE,
            httponly=COOKIE_HTTPONLY,
            domain=COOKIE_DOMAIN,
            path=callback_path,
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
    verify_oauth2_token_request = requests.Request()  # type: ignore [no-untyped-call]
    try:
        id_token = verify_oauth2_token(
            credentials.id_token,
            verify_oauth2_token_request,
            clock_skew_in_seconds=10,
        )  # type: ignore [no-untyped-call]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid id_token: {str(e)}")

    email = id_token.get("email")
    user = users_service.get_user_by_email(session=session, email=email)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user.")

    return_url = check_return_url(request.cookies.get("auth_return_url"))
    if not return_url:
        return_url = "/"
    response = RedirectResponse(return_url)
    access_token_jwt = create_access_token(email=email)
    response.set_cookie(
        "access_token",
        access_token_jwt,
        secure=COOKIE_SECURE,
        httponly=COOKIE_HTTPONLY,
        domain=COOKIE_DOMAIN,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    if refresh_token:
        response.set_cookie(
            "refresh_token",
            refresh_token,
            secure=COOKIE_SECURE,
            httponly=COOKIE_HTTPONLY,
            domain=COOKIE_DOMAIN,
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
        id_token = verify_oauth2_token(
            id_token_jwt,
            request=requests.Request(),  # type: ignore [no-untyped-call]
            clock_skew_in_seconds=10,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid id_token: {str(e)}")

    email = id_token.get("email")
    user = users_service.get_user_by_email(session=session, email=email)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    response = JSONResponse({"status": "success"})
    access_token_jwt = create_access_token(email)
    response.set_cookie(
        "access_token",
        access_token_jwt,
        secure=COOKIE_SECURE,
        httponly=COOKIE_HTTPONLY,
        domain=COOKIE_DOMAIN,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    # extend refresh_token cookie expiration. google refresh tokens don't expire. you must revoke them.
    response.set_cookie(
        "refresh_token",
        refresh_token,
        secure=COOKIE_SECURE,
        httponly=COOKIE_HTTPONLY,
        domain=COOKIE_DOMAIN,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        path="/api/v1/auth/refresh",
    )
    return response
