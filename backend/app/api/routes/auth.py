import base64
import hashlib
import os
import urllib.parse
from html import escape
from urllib.parse import urlparse, urlunparse

import httpx
import tldextract
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.security import authorization_endpoint, token_endpoint

load_dotenv()

router = APIRouter()

LOCAL_DEV_AUTH = settings.DOMAIN == "localhost" and settings.ENVIRONMENT == "local"
if LOCAL_DEV_AUTH:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

COOKIE_SECURE = not LOCAL_DEV_AUTH


def get_root_domain(domain: str) -> str:
    if LOCAL_DEV_AUTH:
        return "localhost"
    extracted = tldextract.extract(domain)
    return escape(extracted.domain) + "." + escape(extracted.suffix)


COOKIE_DOMAIN = get_root_domain(settings.DOMAIN)


def check_return_url(url: str | None) -> str | None:
    return_url = None
    if url:
        return_url_parsed = urlparse(url)
        if return_url_parsed.netloc and get_root_domain(
            return_url_parsed.netloc
        ) == get_root_domain(settings.DOMAIN):
            return_url = urlunparse(components=return_url_parsed)
            if isinstance(return_url, bytes):
                return_url = return_url.decode()
    return return_url


def _scrub_state_part(part: str) -> str:
    return part.replace("~", "%7E").replace(".", "%2E")


@router.get("/login")
async def login(request: Request, return_url: str) -> RedirectResponse:
    random = str(os.urandom(1024))
    signature = hashlib.sha256(
        (random + settings.OIDC_CLIENT_SECRET).encode()
    ).hexdigest()
    query = urllib.parse.urlencode(
        [
            ("response_type", "code"),
            ("redirect_uri", settings.OIDC_REDIRECT_URI),
            ("client_id", settings.OIDC_CLIENT_ID),
            ("scope", "openid email profile"),
            ("state", _scrub_state_part(random) + "." + _scrub_state_part(signature)),
        ],
        safe="*",
    )
    response = RedirectResponse(f"{authorization_endpoint}?{query}")
    auth_return_url = check_return_url(return_url)
    callback_path = "/api/v1/auth/callback"
    if auth_return_url:
        response.set_cookie(
            "auth_return_url",
            auth_return_url,
            httponly=True,
            secure=COOKIE_SECURE,
            domain=COOKIE_DOMAIN,
            path=callback_path,
        )
    return response


@router.get("/callback")
async def callback(request: Request, code: str, state: str) -> RedirectResponse:
    state_parts = state.split(".")
    verify_state = hashlib.sha256(
        (urllib.parse.unquote(state_parts[0]) + settings.OIDC_CLIENT_SECRET).encode()
    ).hexdigest()
    if verify_state != urllib.parse.unquote(state_parts[1]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state"
        )

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            token_endpoint,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.OIDC_REDIRECT_URI,
                "client_id": settings.OIDC_CLIENT_ID,
                "client_secret": settings.OIDC_CLIENT_SECRET,
            },
        )
        response_data = token_response.json()
    if token_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token request"
        )
    return_url = check_return_url(request.cookies.get("auth_return_url"))
    if not return_url:
        return_url = "/"
    response = RedirectResponse(return_url)
    id_token = response_data.get("id_token")
    response.set_cookie(
        key="access_token_cookie",
        value=id_token,
        httponly=False,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=COOKIE_SECURE,
        domain=COOKIE_DOMAIN,
    )
    return response
