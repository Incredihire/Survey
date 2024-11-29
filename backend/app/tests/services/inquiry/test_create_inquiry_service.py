import pytest
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.models.inquiry import MAX_LENGTH, MIN_LENGTH, InquiryCreate
from app.services.inquiries import create_inquiry


def test_inquiry_service_create_should_create_inquiry_when_inquiry_does_not_exist(
    db: Session,
) -> None:
    text = "Test Inquiry"
    inquiry_data = InquiryCreate(text=text, theme_id=None)
    result = create_inquiry(session=db, inquiry_in=inquiry_data)
    assert result.text == text
    assert result.id is not None
    assert result.created_at is not None


def test_create_inquiry_service_should_raise_error_when_no_text_parameter_is_given(
    db: Session,
) -> None:
    with pytest.raises(ValidationError, match=r"Field required"):
        inquiry_data = InquiryCreate()
        create_inquiry(session=db, inquiry_in=inquiry_data)

    with pytest.raises(ValidationError, match=r"Field required"):
        inquiry_data = InquiryCreate(taxed="Taxed inquiry")
        create_inquiry(session=db, inquiry_in=inquiry_data)


def test_create_inquiry_service_should_raise_error_when_text_parameter_is_too_short(
    db: Session,
) -> None:
    short_string = "A" * (MIN_LENGTH - 1)

    with pytest.raises(
        ValidationError, match=f"String should have at least {MIN_LENGTH} characters"
    ):
        inquiry_data = InquiryCreate(text=short_string)
        create_inquiry(session=db, inquiry_in=inquiry_data)


def test_create_inquiry_service_should_raise_error_when_text_parameter_is_too_long(
    db: Session,
) -> None:
    long_string = "A" * (MAX_LENGTH + 1)

    with pytest.raises(
        ValidationError, match=f"String should have at most {MAX_LENGTH} characters"
    ):
        inquiry_data = InquiryCreate(text=long_string)
        create_inquiry(session=db, inquiry_in=inquiry_data)


def test_inquiry_service_create_should_not_create_inquiry_when_inquiry_already_exists(
    db: Session,
) -> None:
    text = "Repeated Inquiry"
    inquiry_data = InquiryCreate(text=text, theme_id=None)
    result = create_inquiry(session=db, inquiry_in=inquiry_data)
    assert result.text == text
    assert result.id is not None
    assert result.created_at is not None
    with pytest.raises(IntegrityError, match="UNIQUE constraint failed"):
        create_inquiry(session=db, inquiry_in=inquiry_data)

    db.rollback()
