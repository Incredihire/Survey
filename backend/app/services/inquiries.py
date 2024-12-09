from sqlmodel import Session, func, select

from app.models import Inquiry, InquiryCreate, InquiryUpdate, Message


def create_inquiry(*, session: Session, inquiry_in: InquiryCreate) -> Inquiry:
    db_inquiry = Inquiry.model_validate(inquiry_in)
    session.add(db_inquiry)
    session.commit()
    session.refresh(db_inquiry)
    return db_inquiry


def update_inquiry(*, session: Session, inquiry_in: InquiryUpdate) -> Inquiry:
    Inquiry.model_validate(inquiry_in)
    inquiry = get_inquiry_by_id(session=session, inquiry_id=inquiry_in.id)
    if not inquiry:
        raise ValueError("Invalid inquiry id for update")
    inquiry_data = inquiry_in.model_dump(exclude_unset=True)
    inquiry.sqlmodel_update(inquiry_data)
    session.commit()
    session.refresh(inquiry)
    return inquiry


def delete_inquiry(*, session: Session, inquiry_id: int) -> Message:
    inquiry = get_inquiry_by_id(session=session, inquiry_id=inquiry_id)
    if not inquiry:
        raise ValueError("Invalid inquiry id for delete")
    session.delete(inquiry)
    session.commit()
    return Message(message="Inquiry deleted")


def get_inquiry_by_text(*, session: Session, text: str) -> Inquiry | None:
    statement = select(Inquiry).where(Inquiry.text == text)
    session_text = session.exec(statement).first()
    return session_text


def get_inquiry_by_id(*, session: Session, inquiry_id: int) -> Inquiry | None:
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
