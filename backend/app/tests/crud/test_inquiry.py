import random
import string

from sqlmodel import Session

from app import crud
from app.models import InquiryCreate


def test_create_inquiry(db: Session) -> None:
    # pylint: disable=B311
    text: str = "".join(random.choice(string.printable) for _ in range(255))
    inquiry_in = InquiryCreate(text=text)
    inquiry = crud.create_inquiry(session=db, inquiry_in=inquiry_in)
    assert inquiry.text == text


def test_get_inquiry(db: Session) -> None:
    length = random.randint(10, 255)
    text = "".join(random.choices(string.ascii_lowercase, k=length)).capitalize()
    inquiry_in = InquiryCreate(text=text)
    created_inquiry = crud.create_inquiry(session=db, inquiry_in=inquiry_in)
    retrieved_inquiry = crud.get_inquiry_by_text(session=db, text=text)
    assert retrieved_inquiry
    assert retrieved_inquiry.text == created_inquiry.text
