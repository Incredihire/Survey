"""Remove Items models

Revision ID: cc1d9e8b003c
Revises: 6a5369b7e7a8
Create Date: 2024-10-05 02:37:16.032804

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "cc1d9e8b003c"
down_revision = "6a5369b7e7a8"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("item")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "item",
        sa.Column(
            "description", sa.VARCHAR(length=255), autoincrement=False, nullable=True
        ),
        sa.Column("title", sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column("id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("owner_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ["owner_id"], ["user.id"], name="item_owner_id_fkey", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="item_pkey"),
    )
    # ### end Alembic commands ###
