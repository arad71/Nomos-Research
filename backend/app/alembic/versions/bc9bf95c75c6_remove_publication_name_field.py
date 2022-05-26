"""Remove publication_name field

Revision ID: bc9bf95c75c6
Revises: fdbdee613975
Create Date: 2022-05-26 10:37:38.579437+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "bc9bf95c75c6"
down_revision = "fdbdee613975"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE publication SET title = publication_name")
    op.drop_column("publication", "publication_name")


def downgrade():
    op.add_column("publication", sa.Column("publication_name", sa.Text()))
    op.execute("UPDATE publication SET publication_name = title")
