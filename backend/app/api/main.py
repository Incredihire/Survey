from fastapi import APIRouter

from app.api.routes import (
    inquiries,
    login,
    schedule,
    scheduled_inquiries,
    themes,
    users,
    utils,
)

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(inquiries.router, prefix="/inquiries", tags=["inquiries"])
api_router.include_router(themes.router, prefix="/themes", tags=["themes"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(
    scheduled_inquiries.router,
    prefix="/scheduledinquiries",
    tags=["scheduled_inquiries"],
)
api_router.include_router(schedule.router, prefix="/schedule", tags=["schedule"])
