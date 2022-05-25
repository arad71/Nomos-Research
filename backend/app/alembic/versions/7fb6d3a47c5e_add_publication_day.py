"""Add publication_day

Revision ID: 7fb6d3a47c5e
Revises: 787145148bc4
Create Date: 2022-05-25 12:49:57.316791+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "7fb6d3a47c5e"
down_revision = "787145148bc4"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("publication", sa.Column("publication_day", sa.Integer()))


def downgrade():
    op.drop_column("publication", "publication_day")
