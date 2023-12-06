"""Add canonical_name.

Revision ID: 5a96be197d03
Revises: 1c5d80976f40
Create Date: 2022-04-18 23:00:09.791849-07:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "5a96be197d03"
down_revision = "80d98a6f30bf"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "taxon_name",
        sa.Column("canonical_name", sa.String(), nullable=True),
    )


def downgrade():
    op.drop_column("taxon_name", "canonical_name")
