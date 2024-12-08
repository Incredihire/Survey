from fastapi import APIRouter, HTTPException

import app.services.inquiries as inquiries_service
from app.api.deps import SessionDep
from app.models import Inquiry, InquiryCreate, InquiryPublic, InquriesPublic, Message
from app.models.inquiry import InquiryUpdate

router = APIRouter()


@router.post("/", response_model=InquiryPublic)
def create_inquiry(*, session: SessionDep, inquiry_in: InquiryCreate) -> Inquiry:
    """
    Create new inquiry.
    """
    inquiry = inquiries_service.get_inquiry_by_text(
        session=session, text=inquiry_in.text
    )
    if inquiry:
        raise HTTPException(
            status_code=400,
            detail="This inquiry already exists.",
        )

    return inquiries_service.create_inquiry(session=session, inquiry_in=inquiry_in)


@router.patch("/", response_model=InquiryPublic)
def update_inquiry(*, session: SessionDep, inquiry_in: InquiryUpdate) -> Inquiry:
    """
    Update inquiry.
    """
    try:
        return inquiries_service.update_inquiry(session=session, inquiry_in=inquiry_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{inquiry_id}", response_model=Message)
def delete_inquiry(*, session: SessionDep, inquiry_id: int) -> Message:
    """
    Delete inquiry.
    """
    try:
        return inquiries_service.delete_inquiry(session=session, inquiry_id=inquiry_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=InquriesPublic)
def get_inquries(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> InquriesPublic:
    """
    Retrieve inquries.
    """
    if skip < 0:
        raise HTTPException(
            status_code=400, detail="Invalid value for 'skip': it must be non-negative"
        )
    if limit <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid value for 'limit': it must be non-negative",
        )

    count = inquiries_service.count_inquiries(session=session)
    inquiries = inquiries_service.get_inquiries(session=session, skip=skip, limit=limit)
    return InquriesPublic(data=inquiries, count=count)


@router.get("/{inquiry_id}", response_model=InquiryPublic)
def read_inquiry(session: SessionDep, inquiry_id: int) -> Inquiry:
    """
    Get inquiry by ID
    """
    inquiry = inquiries_service.get_inquiry_by_id(
        session=session, inquiry_id=inquiry_id
    )
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry
