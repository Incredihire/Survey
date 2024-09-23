import uuid

from sqlmodel import Field, SQLModel


# Shared properties
class ThemeBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1024)


# Properties to receive on theme creation
class ThemeCreate(ThemeBase):
    pass


# Database model, database table inferred from class name
class Theme(ThemeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(min_length=1, max_length=255, unique=True)


# Properties to return via API, id is always required
class ThemePublic(ThemeBase):
    id: uuid.UUID


class ThemesPublic(SQLModel):
    data: list[ThemePublic]
    count: int
