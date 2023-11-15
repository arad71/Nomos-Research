"""Make taxon_name legacy_id varchar

Revision ID: db7b500d8496
Revises: 7664da9ff4c7
Create Date: 2022-06-10 11:25:51.967219+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "db7b500d8496"
down_revision = "7664da9ff4c7"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "taxon_name",
        "legacy_id",
        existing_type=sa.Integer(),
        type_=sa.String(),
        existing_nullable=True,
    )
    op.execute(
        "UPDATE taxon_name set legacy_id = CONCAT('WACENSUS:', legacy_id) WHERE"
        " legacy_id IS NOT NULL"
    )


def downgrade():
    # with the prefix in legacy_id values,
    # column "legacy_id" cannot be cast automatically to type integer
    pass
