"""Rename year to publication_year

Revision ID: 6145ad7b7645
Revises: 665ea730d575
Create Date: 2022-05-24 13:14:27.144001+08:00

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "6145ad7b7645"
down_revision = "665ea730d575"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("publication", "year", new_column_name="publication_year")


def downgrade():
    op.alter_column("publication", "publication_year", new_column_name="year")
