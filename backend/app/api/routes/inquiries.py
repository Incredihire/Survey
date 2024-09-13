import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Inquiry, InquiryCreate, InquiryPublic, Message

router = APIRouter()


@router.post("/", response_model=InquiryPublic)
def create_inquiry(
    *, session: SessionDep, current_user: CurrentUser, inquiry_in: InquiryCreate
) -> Any:
    """
    Create new inquiry.
    """
    inquiry = Inquiry.model_validate(inquiry_in, update={"owner_id": current_user.id})
    session.add(inquiry)
    session.commit()
    session.refresh(inquiry)
    return inquiry
