from collections.abc import Generator

import pytest
from sqlmodel import Session

from app.models import Inquiry, ScheduledInquiry
from app.services import scheduled_inquiries as scheduled_inquiries_service


@pytest.fixture
def db_inquiry_1(db: Session) -> Generator[Inquiry]:
    inquiry = Inquiry(text="I am test inquiry 1")
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    yield inquiry

    db.delete(inquiry)


@pytest.fixture
def db_inquiry_2(db: Session) -> Generator[Inquiry]:
    inquiry = Inquiry(text="I am test inquiry 2")
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    yield inquiry

    db.delete(inquiry)


def test_create_when_no_scheduled_inquiries_exist_should_assign_rank_1(
    db: Session, db_inquiry_1: Inquiry
) -> None:
    expected_rank = 1

    scheduled_inquiry = scheduled_inquiries_service.create(
        session=db,
        inquiry_id=db_inquiry_1.id,  # type: ignore
    )

    db_scheduled_inquiry = db.get(ScheduledInquiry, scheduled_inquiry.id)

    if not db_scheduled_inquiry:
        raise Exception()

    assert db_scheduled_inquiry.rank == expected_rank


def test_create_when_previous_highest_rank_is_1_should_assign_rank_2(
    db: Session, db_inquiry_1: Inquiry, db_inquiry_2: Inquiry
) -> None:
    # First scheduled inquiry will have rank 1
    scheduled_inquiries_service.create(session=db, inquiry_id=db_inquiry_1.id)  # type: ignore

    # Additional scheduled inquiries will be assinged the next highest rank
    next_scheduled_inquiry = scheduled_inquiries_service.create(
        session=db,
        inquiry_id=db_inquiry_2.id,  # type: ignore
    )

    db_scheduled_inquiry = db.get(ScheduledInquiry, next_scheduled_inquiry.id)

    if not db_scheduled_inquiry:
        raise Exception()

    assert db_scheduled_inquiry.rank == 2
