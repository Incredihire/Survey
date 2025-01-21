import os
from typing import Annotated

import jwt
from authlib.integrations.starlette_client import OAuth, OAuthError  # type: ignore
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from jwt.exceptions import DecodeError, ExpiredSignatureError, InvalidSignatureError

import app.services.users as users_service
from app.api.deps import SessionDep
from app.core.config import settings
from app.core.security import access_security, verify_password

load_dotenv()
router = APIRouter()

LOCAL_DEV_AUTH = settings.DOMAIN == "localhost" and settings.ENVIRONMENT == "local"
if LOCAL_DEV_AUTH:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    client_kwargs={"scope": "email openid profile"},
)


@router.get("/oauth")
async def init_oauth(request: Request) -> RedirectResponse:
    """
    Init OAuth flow to get an access token for future requests
    """
    if not request.query_params.get("provider") == "google":
        raise HTTPException(status_code=400, detail="Invalid provider.")
    callback_path = "/api/v1/auth/callback"
    url = f"http{'' if LOCAL_DEV_AUTH else 's'}://{settings.DOMAIN}{callback_path}"
    response: RedirectResponse = await oauth.google.authorize_redirect(
        request, url, access_type="offline"
    )
    response.set_cookie(
        "oauth_provider",
        "google",
        secure=not LOCAL_DEV_AUTH,
        httponly=True,
        domain=settings.DOMAIN,
        path=callback_path,
    )
    return response


@router.get("/callback")
async def callback(session: SessionDep, request: Request) -> RedirectResponse:
    if not request.cookies.get("oauth_provider") == "google":
        raise HTTPException(status_code=400, detail="Invalid provider.")
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")
    user_info = token.get("userinfo")
    email = user_info.get("email")
    user = users_service.get_user_by_email(session=session, email=email)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user.")
    response = RedirectResponse(
        f"http://{settings.DOMAIN}:5173/"
        if LOCAL_DEV_AUTH
        else f"https://{settings.DOMAIN}/"
    )
    subject = {"email": email}
    access_token = access_security.create_access_token(subject)
    access_security.set_access_cookie(
        response, access_token, access_security.access_expires_delta
    )
    refresh_token = access_security.create_refresh_token(subject)
    access_security.set_refresh_cookie(
        response, refresh_token, access_security.refresh_expires_delta
    )
    return response


@router.post("/login")
def login(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> JSONResponse:
    """
    Login request to get an access token for future requests
    """
    user = users_service.get_user_by_email(session=session, email=form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    response = JSONResponse({"status": "success"})
    subject = {"email": user.email}
    access_token = access_security.create_access_token(subject)
    access_security.set_access_cookie(
        response, access_token, access_security.access_expires_delta
    )
    refresh_token = access_security.create_access_token(subject)
    access_security.set_refresh_cookie(
        response, refresh_token, access_security.refresh_expires_delta
    )
    return response


@router.post("/refresh")
async def refresh(session: SessionDep, request: Request) -> JSONResponse:
    refresh_token = request.cookies.get("refresh_token_cookie")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Missing refresh_token.")
    try:
        refresh_token_decoded = jwt.decode(
            refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
    except (DecodeError, ExpiredSignatureError, InvalidSignatureError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh_token"
        )
    subject = refresh_token_decoded.get("subject")
    email = subject.get("email")
    user = users_service.get_user_by_email(session=session, email=email)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    response = JSONResponse({"status": "success"})
    access_token = access_security.create_access_token(subject)
    access_security.set_access_cookie(
        response, access_token, access_security.access_expires_delta
    )
    access_security.set_refresh_cookie(
        response, refresh_token, access_security.refresh_expires_delta
    )
    return response
