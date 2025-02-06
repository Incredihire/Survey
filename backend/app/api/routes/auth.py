import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.security import authorization_endpoint, token_endpoint

FRONTEND_LOCAL_DEV_PORT_LOGIN_COOKIE = "frontend_local_dev_port_login_cookie"

load_dotenv()
local_dev = settings.ENVIRONMENT == "local" and settings.DOMAIN == "localhost"

router = APIRouter()


@router.get("/login")
async def login(request: Request) -> RedirectResponse:
    response = RedirectResponse(
        f"{authorization_endpoint}?response_type=code&redirect_uri={settings.OIDC_REDIRECT_URI}&client_id={settings.OIDC_CLIENT_ID}&scope=openid%20email%20profile"
    )
    if local_dev and str(request.headers.get("Referer")).startswith(
        "http://localhost:5173"
    ):
        response.set_cookie(
            key=FRONTEND_LOCAL_DEV_PORT_LOGIN_COOKIE,
            value=str(True),
            httponly=True,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
    return response


@router.get("/callback")
async def callback(request: Request, code: str) -> RedirectResponse:
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
    id_token = response_data.get("id_token")
    port = (
        ":5173"
        if local_dev
        and request.cookies.get(FRONTEND_LOCAL_DEV_PORT_LOGIN_COOKIE) == str(True)
        else ""
    )
    response = RedirectResponse(f"//{settings.DOMAIN}{port}?auth_callback=true")
    response.set_cookie(
        key="access_token_cookie",
        value=id_token,
        httponly=False,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.ENVIRONMENT != "local",
    )
    return response
