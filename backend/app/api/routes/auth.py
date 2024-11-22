import base64
import hashlib
import logging
import os
import time
from urllib.parse import urlparse, urlunparse

import httpx
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from google.auth.transport import requests
from google.oauth2.credentials import Credentials
from google.oauth2.id_token import verify_oauth2_token
from httpx_oauth.clients.google import ACCESS_TOKEN_ENDPOINT
from oauth2client.client import OAuth2WebServerFlow  # type: ignore [import-untyped]

import app.services.users as users_service
from app.api.deps import SessionDep
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_CONFIG = {
    "web": {
        "client_id": f"{GOOGLE_CLIENT_ID}",
        "project_id": "survey-incredihire",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": f"{GOOGLE_CLIENT_SECRET}",
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
    redirect_uri = request.url_for("auth_callback")
    flow = OAuth2WebServerFlow(
        GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scope=SCOPES,
        redirect_uri=redirect_uri,
        access_type="offline",
        pkce=True,
    )
    state = hashlib.sha256(os.urandom(1024)).hexdigest()
    google_auth_url = flow.step1_get_authorize_url(state=state)
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
    logger.info(f"code_verifier: {flow.code_verifier}")
    if isinstance(flow.code_verifier, bytes):
        response.set_cookie(
            "auth_code_verifier",
            flow.code_verifier.decode(),
            secure=(not local_dev_auth),
            httponly=(not local_dev_auth),
        )
    return response


@router.get("/callback")
async def auth_callback(
    session: SessionDep, code: str, state: str, request: Request
) -> RedirectResponse:
    logger.info(f"callback code_verifier: {request.cookies.get('auth_code_verifier')}")
    if state != request.cookies.get("auth_state"):
        raise HTTPException(status_code=400, detail="Invalid state")
    flow = OAuth2WebServerFlow(
        GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scope=SCOPES,
        redirect_uri=request.url_for("auth_callback"),
        access_type="offline",
        pkce=True,
        code_verifier=request.cookies.get("auth_code_verifier"),
    )
    credentials: Credentials = flow.step2_exchange(code)
    email = credentials.id_token.get("email")
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
    iat = int(time.time())
    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    access_token = {"email": email, "exp": iat + max_age, "iat": iat}
    access_token_jwt = jwt.encode(
        access_token, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    response.set_cookie(
        "access_token",
        access_token_jwt,
        secure=(not local_dev_auth),
        httponly=(not local_dev_auth),
        max_age=max_age,
    )
    if credentials.refresh_token:
        response.set_cookie(
            "refresh_token",
            credentials.refresh_token,
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
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "grant_type": "refresh_token",
    }
    async with httpx.AsyncClient() as client:
        client_response = await client.post(ACCESS_TOKEN_ENDPOINT, data=data)
        client_response.raise_for_status()
        token_response = client_response.json()
    logger.info(f"token_response: {token_response}")
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
    iat = int(time.time())
    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    access_token = {"email": email, "exp": iat + max_age, "iat": iat}
    access_token_jwt = jwt.encode(
        access_token, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    response.set_cookie(
        "access_token",
        access_token_jwt,
        secure=(not local_dev_auth),
        httponly=(not local_dev_auth),
        max_age=max_age,
    )
    return response
