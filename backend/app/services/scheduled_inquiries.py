import logging

from sqlmodel import Session, col, desc, func, select, update

from app.models import (
    Inquiry,
    ScheduledInquiry,
    ScheduledInquiryBase,
    ScheduledInquiryPublic,
    ScheduledInquiryUpdate,
)
from app.models.scheduled_inquiry import ScheduledInquiryPublicWithInquiryText

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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


def enable_scheduled_inquiry(
    *, session: Session, scheduled_inquiry_id: int
) -> ScheduledInquiryPublic:
    stmt = select(ScheduledInquiry).where(ScheduledInquiry.id == scheduled_inquiry_id)
    target: ScheduledInquiry | None = session.exec(stmt).first()
    if not target:
        raise ValueError("Invalid scheduled_inquiry_id to enable")
    highest_rank = session.exec(
        select(ScheduledInquiry.rank).order_by(desc(ScheduledInquiry.rank))
    ).first()
    try:
        target.sqlmodel_update({"rank": highest_rank + 1 if highest_rank else 1})
        session.commit()
    except Exception:
        raise ValueError("Invalid scheduled inquiry update request")
    session.refresh(target)
    return ScheduledInquiryPublic.model_validate(target)


def disable_scheduled_inquiry(
    *, session: Session, scheduled_inquiry_id: int
) -> ScheduledInquiryPublic:
    stmt = select(ScheduledInquiry).where(ScheduledInquiry.id == scheduled_inquiry_id)
    target: ScheduledInquiry | None = session.exec(stmt).first()
    if not target:
        raise ValueError("Invalid scheduled_inquiry_id to disable")
    try:
        target.sqlmodel_update({"rank": 0})
        session.commit()
    except Exception:
        raise ValueError("Invalid scheduled inquiry update request")
    session.refresh(target)
    return ScheduledInquiryPublic.model_validate(target)


def update_scheduled_inquiry(
    *, session: Session, scheduled_inquiry_in: ScheduledInquiryUpdate
) -> ScheduledInquiryPublic:
    stmt = select(ScheduledInquiry).where(
        ScheduledInquiry.id == scheduled_inquiry_in.id
    )
    target: ScheduledInquiry | None = session.exec(stmt).first()
    if not target:
        raise ValueError("Invalid inquiry.id")
    move_rank = (
        scheduled_inquiry_in.rank - target.rank
        if scheduled_inquiry_in.rank > 0
        and target.rank > 0
        and abs(scheduled_inquiry_in.rank - target.rank) == 1
        else 0
    )
    if move_rank != 0:
        # update rank of the scheduled_inquiry currently at target rank
        move_rank_stmt = (
            update(ScheduledInquiry)
            .where(ScheduledInquiry.rank == scheduled_inquiry_in.rank)  # type: ignore [arg-type]
            .values(rank=ScheduledInquiry.rank - move_rank)
        )
        session.exec(move_rank_stmt)  # type: ignore [call-overload]
    ScheduledInquiry.model_validate(scheduled_inquiry_in)
    update_data = scheduled_inquiry_in.model_dump(exclude_unset=True)
    try:
        target.sqlmodel_update(update_data)
        session.commit()
    except Exception:
        raise ValueError("Invalid scheduled inquiry update request")
    session.refresh(target)
    return ScheduledInquiryPublic.model_validate(target)


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
