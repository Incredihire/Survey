import uuid

from sqlmodel import Session, func, select

from app.models import Theme, ThemeCreate


def create_theme(*, session: Session, theme_in: ThemeCreate) -> Theme:
    db_theme = Theme.model_validate(theme_in)
    session.add(db_theme)
    session.commit()
    session.refresh(db_theme)
    return db_theme


def get_theme_by_name(*, session: Session, name: str) -> Theme | None:
    statement = select(Theme).where(Theme.name == name)
    theme = session.exec(statement).first()
    return theme


def get_theme_by_id(*, session: Session, theme_id: uuid.UUID) -> Theme | None:
    theme = session.get(Theme, theme_id)
    return theme


def get_themes(*, session: Session, skip: int = 0, limit: int = 100) -> list[Theme]:
    statement = select(Theme).offset(skip).limit(limit)
    result = session.exec(statement).all()
    return list(result)


def count_themes(*, session: Session) -> int:
    statement = select(func.count()).select_from(Theme)
    return session.exec(statement).one()
