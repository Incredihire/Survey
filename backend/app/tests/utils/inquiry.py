import random
import string

from sqlmodel import Session

from app.models import Inquiry, InquiryCreate
from app.services import inquiries as inquiries_service


def create_random_inquiry(db: Session) -> Inquiry:
    """
    Generates a random inquiry with first letter captialized (10-255 chars)
    and saves it to the db.
    """
    length = random.randint(10, 255)
    text = "".join(random.choices(string.ascii_lowercase, k=length)).capitalize()
    inquiry_in = InquiryCreate(text=text)
    inquiry = inquiries_service.create_inquiry(session=db, inquiry_in=inquiry_in)
    return inquiry
