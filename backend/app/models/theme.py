import uuid

from sqlmodel import Field, SQLModel

MIN_NAME_LENGTH = 1
MAX_NAME_LENGTH = 255
MAX_DESCRIPTION_LENGTH = 1024


# Shared properties
class ThemeBase(SQLModel):
    name: str = Field(min_length=MIN_NAME_LENGTH, max_length=MAX_NAME_LENGTH)
    description: str | None = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)


# Properties to receive on theme creation
class ThemeCreate(ThemeBase):
    pass


# Database model, database table inferred from class name
class Theme(ThemeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(
        min_length=MIN_NAME_LENGTH, max_length=MAX_NAME_LENGTH, unique=True
    )


# Properties to return via API, id is always required
class ThemePublic(ThemeBase):
    id: uuid.UUID


class ThemesPublic(SQLModel):
    data: list[ThemePublic]
    count: int
