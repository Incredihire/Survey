from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse, urlunparse

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from google.auth.transport import requests
from google.oauth2.id_token import verify_oauth2_token
from httpx_oauth.clients.google import ACCESS_TOKEN_ENDPOINT, AUTHORIZE_ENDPOINT

import app.services.users as users_service
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings

load_dotenv()

router = APIRouter()

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET


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
    google_auth_url = f"{AUTHORIZE_ENDPOINT}?client_id={GOOGLE_CLIENT_ID}&redirect_uri={redirect_uri}&response_type=code&scope=openid email profile&state={return_url}&prompt=consent"
    return RedirectResponse(url=google_auth_url)


@router.get("/callback")
async def auth_callback(
    session: SessionDep, code: str, state: str, request: Request
) -> RedirectResponse:
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": request.url_for("auth_callback"),
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        client_response = await client.post(ACCESS_TOKEN_ENDPOINT, data=data)
        client_response.raise_for_status()
        token_response = client_response.json()
    id_token_value = token_response.get("id_token")
    if not id_token_value:
        raise HTTPException(status_code=400, detail="Missing id_token in response.")

    try:
        id_info = verify_oauth2_token(id_token_value, request=requests.Request())  # type: ignore[no-untyped-call]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid id_token: {str(e)}")
    email = id_info.get("email")
    user = users_service.get_user_by_email(session=session, email=email)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = security.create_access_token(user.id, expires=expires)
    return_url_parsed = urlparse(state)
    if (
        not return_url_parsed.scheme
        or not return_url_parsed.netloc
        or return_url_parsed.netloc != settings.DOMAIN
    ):
        raise HTTPException(status_code=400, detail="Invalid referrer")
    return_url = urlunparse(return_url_parsed)
    if isinstance(return_url, bytes):
        return_url = return_url.decode()
    response = RedirectResponse(url=return_url)
    response.set_cookie(
        "access_token",
        access_token,
        secure=(not return_url.startswith("http://localhost")),
        httponly=(not return_url.startswith("http://localhost")),
    )
    response.set_cookie(
        "access_token_expiry",
        expires.isoformat(),
        secure=(not return_url.startswith("http://localhost")),
        httponly=False,
    )
    return response
