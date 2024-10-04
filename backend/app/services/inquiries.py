from uuid import UUID

from sqlmodel import Session, func, select

from app.models import Inquiry, InquiryCreate, InquiryUpdate


def create_inquiry(*, session: Session, inquiry_in: InquiryCreate) -> Inquiry:
    db_inquiry = Inquiry.model_validate(inquiry_in)
    session.add(db_inquiry)
    session.commit()
    session.refresh(db_inquiry)
    return db_inquiry


def get_inquiry_by_text(*, session: Session, text: str) -> Inquiry | None:
    statement = select(Inquiry).where(Inquiry.text == text)
    session_text = session.exec(statement).first()
    return session_text


def get_inquiry_by_id(*, session: Session, inquiry_id: UUID) -> Inquiry | None:
    statement = select(Inquiry).where(Inquiry.id == inquiry_id)
    session_text = session.exec(statement).first()
    return session_text


def get_inquiries(
    *, session: Session, skip: int = 0, limit: int = 100
) -> list[Inquiry]:
    if skip < 0:
        raise ValueError("Invalid value for 'skip': it must be non-negative")
    if limit < 0:
        raise ValueError("Invalid value for 'limit': it must be non-negative")
    statement = select(Inquiry).offset(skip).limit(limit)
    result = session.exec(statement).all()
    return list(result)


def count_inquiries(*, session: Session) -> int:
    statement = select(func.count()).select_from(Inquiry)
    return session.exec(statement).one()


def edit_inquiry(
    *, session: Session, inquiry_id: UUID, inquiry_update: InquiryUpdate
) -> Inquiry:
    db_inquiry = get_inquiry_by_id(session=session, inquiry_id=inquiry_id)
    if db_inquiry is None:
        raise ValueError(f"Inquiry with id {inquiry_id} does not exist")

    if (inquiry_update.text is not None) and (inquiry_update.text != db_inquiry.text):
        db_inquiry.text = inquiry_update.text
        session.add(db_inquiry)
        session.commit()
        session.refresh(db_inquiry)
        return db_inquiry
    else:
        raise ValueError("No changes were made to the inquiry")
