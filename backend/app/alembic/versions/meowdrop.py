"""int pks not uuid

Revision ID: 4b3a5d833604
Revises: 6a5369b7e7a8
Create Date: 2024-10-08 05:44:22.040718

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "4b3a5d833604"
down_revision = "6a5369b7e7a8"
branch_labels = None
depends_on = None


def upgrade():
    for table in (
        "scheduledinquiry",
        "item",
        "response",
        "inquiry",
        "theme",
        "user",
        "schedule",
    ):
        op.drop_table(table)


def downgrade():
    pass
