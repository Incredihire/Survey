from logging import getLogger

from fastapi import APIRouter

router = APIRouter()
logger = getLogger(__name__)

@router.get("/health")
def health_check():
    logger.info("Health check called")
    return {"status": "ok"}