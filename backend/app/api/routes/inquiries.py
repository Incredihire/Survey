import uuid

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

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
    count_statement = select(func.count()).select_from(Inquiry)
    count = session.exec(count_statement).one()

    statement = select(Inquiry).offset(skip).limit(limit)
    inquries = session.exec(statement).all()

    return InquriesPublic(data=inquries, count=count)


@router.get("/{inquiry_id}", response_model=InquiryPublic)
def read_inquiry(session: SessionDep, inquiry_id: uuid.UUID) -> Inquiry:
    """
    Get inquiry by ID
    """
    inquiry = session.get(Inquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry
