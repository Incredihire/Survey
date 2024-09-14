from sqlmodel import Session
import random
import string

from app import crud
from app.models import InquiryCreate

def test_create_inquiry(db: Session) -> None:
    text: str = ''.join(random.choice(string.printable) for _ in range(255))
    inquiry_in = InquiryCreate(text=text)
    inquiry = crud.create_inquiry(session=db, inquiry_in=inquiry_in)
    assert inquiry.text == text
