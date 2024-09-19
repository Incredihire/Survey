import random
import string

from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

import app.services.inquiries as inquiries_service
from app.models import Inquiry, InquiryCreate


def test_create_inquiry(db: Session) -> None:
    # pylint: disable=B311
    text: str = "".join(random.choice(string.printable) for _ in range(255))
    inquiry_in = InquiryCreate(text=text)
    inquiry = inquiries_service.create_inquiry(session=db, inquiry_in=inquiry_in)
    assert inquiry.text == text


def test_get_inquiry(db: Session) -> None:
    length = random.randint(10, 255)
    text = "".join(random.choices(string.ascii_lowercase, k=length)).capitalize()
    inquiry_in = InquiryCreate(text=text)
    created_inquiry = inquiries_service.create_inquiry(
        session=db, inquiry_in=inquiry_in
    )
    retrieved_inquiry = db.get(Inquiry, created_inquiry.id)
    assert retrieved_inquiry
    assert retrieved_inquiry.text == created_inquiry.text
    assert jsonable_encoder(created_inquiry) == jsonable_encoder(retrieved_inquiry)
