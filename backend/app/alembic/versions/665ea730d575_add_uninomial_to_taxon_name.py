"""Add uninomial to taxon name

Revision ID: 665ea730d575
Revises: 295b4718da38
Create Date: 2022-05-22 06:34:56.371290+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "665ea730d575"
down_revision = "4b15d68fbe48"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("taxon_name", sa.Column("uninomial", sa.VARCHAR()))
    op.execute("UPDATE taxon_name SET uninomial = genus")


def downgrade():
    op.drop_column("taxon_name", "uninomial")
