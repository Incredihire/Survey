from sqlmodel import Session, col, desc, func, select

from app.models import (
    Inquiry,
    ScheduledInquiry,
    ScheduledInquiryBase,
    ScheduledInquiryPublic,
)
from app.models.scheduled_inquiry import ScheduledInquiryPublicWithInquiryText


def create(*, session: Session, inquiry_id: int) -> ScheduledInquiryPublic:
    highest_rank = session.exec(
        select(ScheduledInquiry.rank).order_by(desc(ScheduledInquiry.rank))
    ).first()

    rank = highest_rank + 1 if highest_rank else 1

    scheduled_inquiry = ScheduledInquiryBase(inquiry_id=inquiry_id, rank=rank)

    db_inquiry = ScheduledInquiry.model_validate(scheduled_inquiry)

    session.add(db_inquiry)
    session.commit()
    session.refresh(db_inquiry)

    return ScheduledInquiryPublic.model_validate(db_inquiry)


def get_scheduled_inquiries(
    *, session: Session, skip: int = 0, limit: int = 100
) -> list[ScheduledInquiryPublicWithInquiryText]:
    if skip < 0:
        raise ValueError("Invalid value for 'skip': it must be non-negative")
    if limit < 0:
        raise ValueError("Invalid value for 'limit': it must be non-negative")

    result = session.exec(
        select(ScheduledInquiry.id, ScheduledInquiry.rank, Inquiry.id, Inquiry.text)
        .join(Inquiry)
        .where(ScheduledInquiry.inquiry_id == Inquiry.id)
        .order_by(col(ScheduledInquiry.rank).asc())
        .offset(skip)
        .limit(limit)
    ).all()

    inquiries = [
        ScheduledInquiryPublicWithInquiryText(
            id=scheduled_inquiry_id,
            rank=rank,
            inquiry_id=inquiry_id,
            text=text,
        )
        for scheduled_inquiry_id, rank, inquiry_id, text in result
    ]

    return inquiries


def get_count(*, session: Session) -> int:
    count_statement = select(func.count()).select_from(ScheduledInquiry)
    return session.exec(count_statement).one()
