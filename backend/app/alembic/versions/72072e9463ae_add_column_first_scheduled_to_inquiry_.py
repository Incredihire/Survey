"""Add column first_scheduled to Inquiry model

Revision ID: 72072e9463ae
Revises: 313b29d9764f
Create Date: 2024-12-02 17:11:38.152488

"""

import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = "72072e9463ae"
down_revision = "313b29d9764f"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("inquiry", sa.Column("first_scheduled", sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("inquiry", "first_scheduled")
    # ### end Alembic commands ###
