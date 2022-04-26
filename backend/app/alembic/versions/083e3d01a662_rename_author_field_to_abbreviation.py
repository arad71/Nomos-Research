"""Rename author field to abbreviation.

Revision ID: 083e3d01a662
Revises: 083e3d01a662
Create Date: 2022-04-26 00:36:09.410212-07:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "083e3d01a662"
down_revision = "5a96be197d03"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("author", "author", new_column_name="abbreviation")
    op.create_unique_constraint("uc_author_abbreviation", "author", ["abbreviation"])


def downgrade():
    op.drop_constraint("uc_author_abbreviation")
    op.alter_column("author", "abbreviation", new_column_name="author")
