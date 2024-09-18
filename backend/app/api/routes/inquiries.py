import uuid

from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import SessionDep
from app.models import Inquiry, InquiryCreate, InquiryPublic, InquriesPublic

router = APIRouter()


@router.post("/", response_model=InquiryPublic)
def create_inquiry(*, session: SessionDep, inquiry_in: InquiryCreate) -> Inquiry:
    """
    Create new inquiry.
    """
    inquiry = crud.get_inquiry_by_text(session=session, text=inquiry_in.text)
    if inquiry:
        raise HTTPException(
            status_code=400,
            detail="This inquiry already exists.",
        )

    inquiry = Inquiry.model_validate(inquiry_in)
    session.add(inquiry)
    session.commit()
    session.refresh(inquiry)
    return inquiry


@router.get("/", response_model=InquriesPublic)
def read_inquries(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> InquriesPublic:
    """
    Retrieve inquries.
    """
    count = crud.count_inquiries(session=session)
    inquiries = crud.get_inquiries(session=session, skip=skip, limit=limit)

    return InquriesPublic(data=inquiries, count=count)


@router.get("/{inquiry_id}", response_model=InquiryPublic)
def read_inquiry(session: SessionDep, inquiry_id: uuid.UUID) -> Inquiry:
    """
    Get inquiry by ID
    """
    inquiry = crud.get_inquiry_by_id(session=session, inquiry_id=inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry
