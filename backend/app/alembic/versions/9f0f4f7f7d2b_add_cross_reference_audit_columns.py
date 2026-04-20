"""add cross reference audit columns

Revision ID: 9f0f4f7f7d2b
Revises: daff8f710810
Create Date: 2026-03-19 15:55:00.000000+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "9f0f4f7f7d2b"
down_revision = "daff8f710810"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def upgrade():

    if not column_exists("cross_reference", "authorised_on"):
        op.add_column(
            "cross_reference",
            sa.Column("authorised_on", sa.TIMESTAMP(timezone=True)),
        )

    if not column_exists("cross_reference", "contributed_by"):
        op.add_column(
            "cross_reference",
            sa.Column("contributed_by", sa.CHAR(length=100)),
        )

    if not column_exists("cross_reference", "contributed_on"):
        op.add_column(
            "cross_reference",
            sa.Column("contributed_on", sa.TIMESTAMP(timezone=True)),
        )


def downgrade():

    if column_exists("cross_reference", "contributed_on"):
        op.drop_column("cross_reference", "contributed_on")

    if column_exists("cross_reference", "contributed_by"):
        op.drop_column("cross_reference", "contributed_by")

    if column_exists("cross_reference", "authorised_on"):
        op.drop_column("cross_reference", "authorised_on")
