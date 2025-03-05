from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.routes import auth, health, inquiries, schedule, themes, users, utils

PROTECTED = Depends(get_current_user)
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    inquiries.router, prefix="/inquiries", tags=["inquiries"], dependencies=[PROTECTED]
)
api_router.include_router(
    themes.router, prefix="/themes", tags=["themes"], dependencies=[PROTECTED]
)
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(
    schedule.router, prefix="/schedule", tags=["schedule"], dependencies=[PROTECTED]
)
api_router.include_router(health.router, prefix="/health", tags=["health"])
