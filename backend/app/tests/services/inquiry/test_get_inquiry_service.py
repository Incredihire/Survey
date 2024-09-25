import pytest
from sqlmodel import Session

from app.models import Inquiry
from app.services.inquiries import get_inquiry_by_id

# Naming Convention:
# <FUT>_when<Scenario>_should<Outcome>
# ex. addTwoNumbers_whenOneNumberIsZero_shouldReturnTheSecondNumber


@pytest.fixture(scope="module")
def setup_data(db: Session) -> Inquiry:
    single_inquiry = Inquiry(text="How's your work-life balance?")
    db.add(single_inquiry)
    db.commit()
    return single_inquiry


def getSingleInquiryService_whenCalledWithValidId_shouldReturnMatchingInquiry(
    db: Session, sample_inquiry: Inquiry
) -> None:
    result = get_inquiry_by_id(session=db, inquiry_id=sample_inquiry.id)
    assert result is not None
    assert result.id == sample_inquiry.id
    assert result.text == sample_inquiry.text
