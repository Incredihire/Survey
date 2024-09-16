import random
import string

from sqlmodel import Session

import app.services.inquiry as crud
from app.models.inquiry import InquiryCreate


def test_create_inquiry(db: Session) -> None:
    # pylint: disable=B311
    text: str = "".join(random.choice(string.printable) for _ in range(255))
    inquiry_in = InquiryCreate(text=text)
    inquiry = crud.create_inquiry(session=db, inquiry_in=inquiry_in)
    assert inquiry.text == text
