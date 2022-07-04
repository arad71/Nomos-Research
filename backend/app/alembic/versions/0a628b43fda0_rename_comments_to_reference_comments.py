"""Rename comments to reference_comments

Revision ID: 0a628b43fda0
Revises: 638c550d8108
Create Date: 2022-07-04 09:37:23.232774+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0a628b43fda0"
down_revision = "638c550d8108"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("cross_reference", "comments", new_column_name="reference_comments")


def downgrade():
    op.alter_column("cross_reference", "reference_comments", new_column_name="comments")
