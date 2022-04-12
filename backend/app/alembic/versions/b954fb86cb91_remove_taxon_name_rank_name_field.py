"""Remove redundant 'rank name' field from taxon_name.

Revision ID: b954fb86cb91
Revises: 3c31cbd94af9
Create Date: 2022-04-10 23:05:24.917920-07:00

"""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = "b954fb86cb91"
down_revision = "eae5974b5d57"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("taxon_name", "rank_name")


def downgrade():
    op.add_column(
        "taxon_name",
        sa.Column(
            "rank_name",
            sa.VARCHAR(length=15),
            autoincrement=False,
            nullable=False,
            comment=(
                "A duplicate of the rankname field in HBTRanks. To aid performance."
            ),
        ),
    )
