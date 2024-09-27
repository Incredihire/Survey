import pytest
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.models.theme import MAX_NAME_LENGTH, MIN_NAME_LENGTH, ThemeCreate
from app.services import themes


def test_create_theme_when_theme_does_not_exist_should_create_theme(
    db: Session,
) -> None:
    name = "TestTheme"
    description = "This is a test theme."
    theme_data = ThemeCreate(name=name, description=description)

    created_theme = themes.create_theme(session=db, theme_in=theme_data)

    assert created_theme.name == name
    assert created_theme.description == description
    assert created_theme.id is not None


def test_create_theme_when_name_is_missing_should_raise_validation_error(
    db: Session,
) -> None:
    with pytest.raises(ValidationError, match=r"Field required"):
        theme_data = ThemeCreate(description="Test description")
        themes.create_theme(session=db, theme_in=theme_data)


def test_create_theme_when_name_is_too_short_should_raise_validation_error(
    db: Session,
) -> None:
    short_name = "A" * (MIN_NAME_LENGTH - 1)

    with pytest.raises(
        ValidationError,
        match=f"String should have at least {MIN_NAME_LENGTH} character",
    ):
        theme_data = ThemeCreate(name=short_name)
        themes.create_theme(session=db, theme_in=theme_data)


def test_create_theme_when_name_is_too_long_should_raise_validation_error(
    db: Session,
) -> None:
    long_name = "A" * (MAX_NAME_LENGTH + 1)

    with pytest.raises(
        ValidationError,
        match=f"String should have at most {MAX_NAME_LENGTH} characters",
    ):
        theme_data = ThemeCreate(name=long_name)
        themes.create_theme(session=db, theme_in=theme_data)


def test_create_theme_when_theme_already_exists_should_raise_integrity_error(
    db: Session,
) -> None:
    name = "RepeatedTheme"
    theme_data = ThemeCreate(name=name)
    themes.create_theme(session=db, theme_in=theme_data)

    with pytest.raises(IntegrityError, match="UNIQUE constraint failed"):
        themes.create_theme(session=db, theme_in=theme_data)
    db.rollback()
