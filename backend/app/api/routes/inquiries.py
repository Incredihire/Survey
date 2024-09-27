import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlmodel import Session

import app.services.inquiries as inquiries_service
from app.api.deps import SessionDep
from app.models import (
    Inquiry,
    InquiryCreate,
    InquiryPublic,
    InquiryUpdate,
    InquriesPublic,
)
from app.services import inquiries as inquiries_service

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


@router.get("/", response_model=InquriesPublic)
def get_inquries(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> InquriesPublic:
    """
    Retrieve inquries.
    """
    count = inquiries_service.count_inquiries(session=session)
    inquiries = inquiries_service.get_inquiries(session=session, skip=skip, limit=limit)
    return InquriesPublic(data=inquiries, count=count)


@router.get("/{inquiry_id}", response_model=InquiryPublic)
def read_inquiry(session: SessionDep, inquiry_id: uuid.UUID) -> Inquiry:
    """
    Get inquiry by ID
    """
    inquiry = inquiries_service.get_inquiry_by_id(
        session=session, inquiry_id=inquiry_id
    )
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry


@router.put("/{inquiry_id}", response_model=InquiryPublic)
def update_inquiry(
    session: SessionDep, inquiry_id: uuid.UUID, inquiry_update: InquiryUpdate
) -> Inquiry:
    """
    Update an inquiry.
    """
    inquiry = inquiries_service.get_inquiry_by_id(
        session=session, inquiry_id=inquiry_id
    )
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiries_service.edit_inquiry(
        session=session, inquiry_id=inquiry_id, inquiry_update=inquiry_update
    )
