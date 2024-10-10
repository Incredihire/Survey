import pytest
from sqlmodel import Session

from app.models import Inquiry
from app.services.inquiries import get_inquiry_by_id
from app.tests.utils.utils import bad_integer_id


@pytest.fixture(name="single_inquiry", scope="function")
def fixture_single_inquiry(db: Session) -> Inquiry:
    single_inquiry = Inquiry(text="How's your work-life balance?")
    db.add(single_inquiry)
    db.commit()
    return single_inquiry


def test_getInquiryService_whenCalledWithExistentId_shouldReturnMatchingInquiry(
    db: Session, single_inquiry: Inquiry
) -> None:
    result = get_inquiry_by_id(session=db, inquiry_id=single_inquiry.id)  # type: ignore
    assert result is not None
    assert result.id == single_inquiry.id
    assert result.text == single_inquiry.text


def test_getInquiryService_whenCalledWithNonExistentId_shouldReturnNone(
    db: Session,
) -> None:
    non_existent_id = bad_integer_id
    result = get_inquiry_by_id(session=db, inquiry_id=non_existent_id)
    assert result is None
