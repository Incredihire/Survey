from sqlmodel import Field


class IdMixin:
    id: int | None = Field(default=None, primary_key=True)
