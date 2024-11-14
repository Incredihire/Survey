import os

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from google.auth.transport import requests
from google.oauth2 import id_token

import app.services.users as users_service
from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.models import User, UserCreate

load_dotenv()

router = APIRouter()

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET


@router.get("/login")
async def login(state: str, request: Request):
    redirect_uri = request.url_for("auth_callback")
    google_auth_url = f"{settings.GOOGLE_AUTHORIZATION_URL}?client_id={GOOGLE_CLIENT_ID}&redirect_uri={redirect_uri}&response_type=code&scope=openid email profile&state={state}"
    return RedirectResponse(url=google_auth_url)


@router.get("/callback")
async def auth_callback(session: SessionDep, code: str, state: str, request: Request):
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": request.url_for("auth_callback"),
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(settings.GOOGLE_TOKEN_URL, data=data)
        response.raise_for_status()
        token_response = response.json()
    id_token_value = token_response.get("id_token")
    if not id_token_value:
        raise HTTPException(status_code=400, detail="Missing id_token in response.")
    try:
        try:
            id_info = id_token.verify_oauth2_token(
                id_token_value, requests.Request(), GOOGLE_CLIENT_ID
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid id_token: {str(e)}")
        email = id_info.get("email")
        user = users_service.get_user_by_email(session=session, email=email)
        if not user:
            user = users_service.create_user(
                session=session,
                user_create=UserCreate(
                    email=email, password="changethis", full_name=id_info.get("name")
                ),
            )
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        response = RedirectResponse(url=state)
        access_token = token_response.get("access_token")
        expires_in = token_response.get("expires_in")
        request.session["access_token"] = access_token
        request.session["email"] = email
        response.set_cookie("access_token", access_token, expires_in)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
