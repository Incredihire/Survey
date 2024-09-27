import uuid

import pytest
from sqlmodel import Session

from app.models import Inquiry
from app.services.inquiries import get_inquiry_by_id


@pytest.fixture(name="single_inquiry", scope="module")
def fixture_single_inquiry(db: Session) -> Inquiry:
    single_inquiry = Inquiry(text="How's your work-life balance?")
    db.add(single_inquiry)
    db.commit()
    return single_inquiry


def test_getInquiryService_whenCalledWithInvalidId_shouldRaiseException(
    db: Session,
) -> None:
    with pytest.raises(ValueError, match=r"Id must be a valid UUID"):
        get_inquiry_by_id(session=db, inquiry_id=12345)  # ruff: noqa

    with pytest.raises(ValueError, match=r"Id must be a valid UUID"):
        get_inquiry_by_id(session=db, inquiry_id="12345")  # ruff: noqa

    with pytest.raises(ValueError, match=r"Id must be a valid UUID"):
        # ruff: noqa
        get_inquiry_by_id(session=db, inquiry_id="id")


def test_getInquiryService_whenCalledWithExistentId_shouldReturnMatchingInquiry(
    db: Session, single_inquiry: Inquiry
) -> None:
    result = get_inquiry_by_id(session=db, inquiry_id=single_inquiry.id)
    assert result is not None
    assert result.id == single_inquiry.id
    assert result.text == single_inquiry.text


def test_getInquiryService_whenCalledWithNonExistentId_shouldReturnNone(
    db: Session,
) -> None:
    random_uuid = uuid.uuid4()
    result = get_inquiry_by_id(session=db, inquiry_id=random_uuid)
    assert result is None
