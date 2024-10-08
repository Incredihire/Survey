from fastapi import APIRouter, HTTPException

import app.services.themes as themes_service
from app.api.deps import SessionDep
from app.models import Theme, ThemeCreate, ThemePublic, ThemesPublic

router = APIRouter()


@router.post("/", response_model=ThemePublic)
def create_theme(*, session: SessionDep, theme_in: ThemeCreate) -> Theme:
    """
    Create new theme.
    """
    theme = themes_service.get_theme_by_name(session=session, name=theme_in.name)
    if theme:
        raise HTTPException(
            status_code=400,
            detail="This theme already exists.",
        )
    return themes_service.create_theme(session=session, theme_in=theme_in)


@router.get("/", response_model=ThemesPublic)
def get_themes(session: SessionDep, skip: int = 0, limit: int = 100) -> ThemesPublic:
    """
    Retrieve themes.
    """
    count = themes_service.count_themes(session=session)
    themes = themes_service.get_themes(session=session, skip=skip, limit=limit)
    return ThemesPublic(data=themes, count=count)


@router.get("/{theme_id}", response_model=ThemePublic)
def read_theme(session: SessionDep, theme_id: int) -> Theme:
    """
    Get theme by ID
    """
    theme = themes_service.get_theme_by_id(session=session, theme_id=theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return theme
