from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep
from app.models import ScheduledInquiryCreate, ScheduledInquiryPublic
from app.models.scheduled_inquiry import (
    ScheduledInquiriesPublic,
    ScheduledInquiryUpdate,
)
from app.services import (
    inquiries as inquiries_service,
)
from app.services import (
    scheduled_inquiries as scheduled_inquiries_service,
)

router = APIRouter()


@router.post("/", response_model=ScheduledInquiryPublic)
def add_to_schedule(
    *,
    session: SessionDep,
    scheduled_inquiry_in: ScheduledInquiryCreate,
) -> ScheduledInquiryPublic:
    inquiry_id = scheduled_inquiry_in.inquiry_id

    inquiry_exists = inquiries_service.get_inquiry_by_id(
        session=session, inquiry_id=inquiry_id
    )

    if not inquiry_exists:
        raise HTTPException(status_code=422, detail="Inquiry not found")

    scheduled_inquiry = scheduled_inquiries_service.create(
        session=session, inquiry_id=inquiry_id
    )

    return scheduled_inquiry


@router.patch("/", response_model=ScheduledInquiryPublic)
def update_scheduled_inquiry(
    *, session: SessionDep, scheduled_inquiry_in: ScheduledInquiryUpdate
) -> ScheduledInquiryPublic:
    """
    Update scheduled inquiry.
    """
    try:
        return scheduled_inquiries_service.update_scheduled_inquiry(
            session=session, scheduled_inquiry_in=scheduled_inquiry_in
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/disable", response_model=ScheduledInquiryPublic)
def disable_scheduled_inquiry(
    *, session: SessionDep, scheduled_inquiry_id: int
) -> ScheduledInquiryPublic:
    """
    Disable scheduled inquiry.
    """
    try:
        return scheduled_inquiries_service.disable_scheduled_inquiry(
            session=session, scheduled_inquiry_id=scheduled_inquiry_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/enable", response_model=ScheduledInquiryPublic)
def enable_scheduled_inquiry(
    *, session: SessionDep, scheduled_inquiry_id: int
) -> ScheduledInquiryPublic:
    """
    Enable scheduled inquiry.
    """
    try:
        return scheduled_inquiries_service.enable_scheduled_inquiry(
            session=session, scheduled_inquiry_id=scheduled_inquiry_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=ScheduledInquiriesPublic)
def get_scheduled_inquries(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> ScheduledInquiriesPublic:
    if skip < 0:
        raise HTTPException(
            status_code=400, detail="Invalid value for 'skip': it must be non-negative"
        )
    if limit <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid value for 'limit': it must be non-negative",
        )

    scheduled_inquiries = scheduled_inquiries_service.get_scheduled_inquiries(
        session=session, skip=skip, limit=limit
    )

    total_count = scheduled_inquiries_service.get_count(session=session)

    return ScheduledInquiriesPublic(data=scheduled_inquiries, count=total_count)
