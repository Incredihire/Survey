from unittest.mock import MagicMock, patch

from sqlmodel import Session, select

from app.backend_pre_start import init, logger
from app.core.db import engine


@MagicMock(spec=Session)
def test_init_successful_connection(session_mock: MagicMock) -> None:
    session_mock.exec = MagicMock(return_value=True)
    with (
        patch("sqlmodel.Session", return_value=session_mock),
        patch.object(logger, "info"),
        patch.object(logger, "error"),
        patch.object(logger, "warn"),
    ):
        try:
            init(engine)
            connection_successful = True
        except Exception:
            connection_successful = False

        assert (
            connection_successful
        ), "The database connection should be successful and not raise an exception."
        session_mock.exec.assert_called_once_with(select(1))
