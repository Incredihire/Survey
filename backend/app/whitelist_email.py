import logging
import sys

from sqlmodel import Session

from app.core.db import engine, whitelist_email

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    arg_count = len(sys.argv)
    if arg_count > 1:
        with Session(engine) as session:
            whitelist_email(
                session,
                email=sys.argv[1],
                is_superuser=arg_count > 2 and sys.argv[2].lower() == "true",
            )
    else:
        logger.info(
            "Please provide an email address and an optional boolean to indicate if the user is a superuser"
        )


if __name__ == "__main__":
    main()
