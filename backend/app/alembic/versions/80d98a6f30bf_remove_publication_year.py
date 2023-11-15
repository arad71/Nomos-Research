"""Remove publication year.

Revision ID: 80d98a6f30bf
Revises: 1c5d80976f40
Create Date: 2022-04-18 22:27:54.026013-07:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "80d98a6f30bf"
down_revision = "1c5d80976f40"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("taxon_name", "publication_year")


def downgrade():
    op.add_column(
        "taxon_name",
        sa.Column(
            "publication_year",
            sa.INTEGER(),
            autoincrement=False,
            nullable=True,
            comment="The year of publication",
        ),
    )
