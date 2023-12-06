"""Unique constraint kingdom_id rank_name

Revision ID: 7afd7544127e
Revises: 0a628b43fda0
Create Date: 2022-07-19 13:42:44.801706+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "7afd7544127e"
down_revision = "0a628b43fda0"
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint(
        "unique_rank_name_in_kingdom",
        "taxon_rank",
        ["kingdom_id", "rank_name"],
    )


def downgrade():
    op.drop_constraint("unique_rank_name_in_kingdom", "taxon_rank", type_="unique")
