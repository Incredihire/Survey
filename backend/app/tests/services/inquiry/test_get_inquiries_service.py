import pytest
from sqlmodel import Session

from app.models import Inquiry
from app.services.inquiries import get_inquiries


@pytest.fixture(name="two_hundred_inquiries", scope="function")
def fixture_two_hundred_inquiries(db: Session) -> list[Inquiry]:
    inquiry_texts = [f"Inquiry #{i + 1}" for i in range(200)]
    inquiries = [Inquiry(text=text) for text in inquiry_texts]
    db.add_all(inquiries)
    db.commit()
    return inquiries


@pytest.fixture(name="fifty_inquiries", scope="function")
def fixture_fifty_inquiries(db: Session) -> list[Inquiry]:
    inquiry_texts = [f"Inquiry #{i + 1}" for i in range(50)]
    inquiries = [Inquiry(text=text) for text in inquiry_texts]
    db.add_all(inquiries)
    db.commit()
    return inquiries


def test_getInquiriesService_whenTableIsEmpty_shouldReturnEmptyList(
    db: Session,
) -> None:
    result = get_inquiries(session=db)
    assert len(result) == 0


def test_getInquiriesService_whenTableHasTwoHundredInquiries_shouldReturnOneHundredInquiries(
    db: Session, two_hundred_inquiries: list[Inquiry]
) -> None:
    result = get_inquiries(session=db)
    assert len(result) == 100
    assert {inquiry.id for inquiry in result} == {
        inquiry.id for inquiry in two_hundred_inquiries[:100]
    }


def test_getInquiriesService_whenTableHasFiftyInquiries_shouldReturnFiftyInquiries(
    db: Session, fifty_inquiries: list[Inquiry]
) -> None:
    result = get_inquiries(session=db)
    assert len(result) == len(fifty_inquiries)
    assert {inquiry.id for inquiry in result} == {
        inquiry.id for inquiry in fifty_inquiries
    }


def test_getInquiriesService_whenSkipIsLessThanTotalInquiries_shouldReturnRemainingInquiries(
    db: Session, two_hundred_inquiries: list[Inquiry]
) -> None:
    result = get_inquiries(session=db, skip=150)
    assert len(result) == 50
    assert {inquiry.id for inquiry in result} == {
        inquiry.id for inquiry in two_hundred_inquiries[150:]
    }


def test_getInquiriesService_whenSkipExceedsTotalInquiries_shouldReturnEmptyList(
    db: Session, two_hundred_inquiries: list[Inquiry]
) -> None:
    del two_hundred_inquiries  # To ignore unused two_hundred_inquires fixture param
    result = get_inquiries(session=db, skip=250)
    assert len(result) == 0


def test_getInquiriesService_whenSkipIsNegative_shouldRaiseValueError(
    db: Session,
) -> None:
    with pytest.raises(
        ValueError, match=r"Invalid value for 'skip': it must be non-negative"
    ):
        get_inquiries(session=db, skip=-1)


def test_getInquiriesService_withLimit_shouldReturnLimitedInquiries(
    db: Session, two_hundred_inquiries: list[Inquiry]
) -> None:
    result = get_inquiries(session=db, limit=50)
    assert len(result) == 50
    assert {inquiry.id for inquiry in result} == {
        inquiry.id for inquiry in two_hundred_inquiries[:50]
    }


def test_getInquiriesService_whenLimitExceedsTotalInquiries_shouldReturnAllInquiries(
    db: Session, two_hundred_inquiries: list[Inquiry]
) -> None:
    result = get_inquiries(session=db, limit=300)
    assert len(result) == len(two_hundred_inquiries)
    assert {inquiry.id for inquiry in result} == {
        inquiry.id for inquiry in two_hundred_inquiries
    }


def test_getInquiriesService_whenLimitIsZero_shouldReturnEmptyList(
    db: Session, two_hundred_inquiries: list[Inquiry]
) -> None:
    del two_hundred_inquiries  # To ignore unused two_hundred_inquires fixture param
    result = get_inquiries(session=db, limit=0)
    assert len(result) == 0


def test_getInquiriesService_whenLimitIsNegative_shouldRaiseValueError(
    db: Session, two_hundred_inquiries: list[Inquiry]
) -> None:
    del two_hundred_inquiries  # To ignore unused two_hundred_inquires fixture param
    with pytest.raises(
        ValueError, match=r"Invalid value for 'limit': it must be non-negative"
    ):
        get_inquiries(session=db, limit=-1)
