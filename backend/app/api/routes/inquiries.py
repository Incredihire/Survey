from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app import crud
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
    inquiry = crud.get_inquiry_by_text(session=session, text=inquiry_in.text)
    if inquiry:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    inquiry = Inquiry.model_validate(inquiry_in, update={"owner_id": current_user.id})
    session.add(inquiry)
    session.commit()
    session.refresh(inquiry)
    return inquiry
