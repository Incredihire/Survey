from typing import Any

from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import SessionDep
from app.models import Inquiry, InquiryCreate, InquiryPublic

router = APIRouter()


@router.post("/", response_model=InquiryPublic)
def create_inquiry(
    *, session: SessionDep, inquiry_in: InquiryCreate
) -> Any:
    """
    Create new inquiry.
    """
    inquiry = crud.get_inquiry_by_text(session=session, text=inquiry_in.text)
    if inquiry:
        raise HTTPException(
            status_code=400,
            detail="This question already exists.",
        )

    inquiry = Inquiry.model_validate(inquiry_in)
    session.add(inquiry)
    session.commit()
    session.refresh(inquiry)
    return inquiry
