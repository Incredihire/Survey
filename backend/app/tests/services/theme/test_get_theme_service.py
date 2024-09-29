import uuid

from sqlmodel import Session

from app.models.theme import ThemeCreate
from app.services import themes


def test_get_theme_by_name_when_theme_is_created_should_retrieve_theme(
    db: Session,
) -> None:
    name = "TestAnotherTheme"
    description = "This is a test theme."
    theme_data = ThemeCreate(name=name, description=description)

    created_theme = themes.create_theme(session=db, theme_in=theme_data)

    retrieved_theme = themes.get_theme_by_name(session=db, name=name)

    assert retrieved_theme is not None
    assert retrieved_theme.name == created_theme.name
    assert retrieved_theme.description == created_theme.description
    assert retrieved_theme.id == created_theme.id


def test_get_theme_by_name_when_theme_does_not_exist_should_return_none(
    db: Session,
) -> None:
    theme = themes.get_theme_by_name(session=db, name="NonExistent")
    assert theme is None


def test_get_theme_by_id_when_theme_exists_should_retrieve_theme(db: Session) -> None:
    theme_data = ThemeCreate(name="UniqueTheme", description="Unique description")
    created_theme = themes.create_theme(session=db, theme_in=theme_data)

    retrieved_theme = themes.get_theme_by_id(session=db, theme_id=created_theme.id)

    assert retrieved_theme is not None
    assert retrieved_theme.id == created_theme.id


def test_get_theme_by_id_when_theme_does_not_exist_should_return_none(
    db: Session,
) -> None:
    non_existent_id = uuid.uuid4()
    theme = themes.get_theme_by_id(session=db, theme_id=non_existent_id)
    assert theme is None
