"""add cross reference audit columns

Revision ID: 9f0f4f7f7d2b
Revises: daff8f710810
Create Date: 2026-03-19 15:55:00.000000+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "9f0f4f7f7d2b"
down_revision = "daff8f710810"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "cross_reference",
        sa.Column("authorised_on", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "cross_reference",
        sa.Column("contributed_by", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "cross_reference",
        sa.Column("contributed_on", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_column("cross_reference", "contributed_on")
    op.drop_column("cross_reference", "contributed_by")
    op.drop_column("cross_reference", "authorised_on")
