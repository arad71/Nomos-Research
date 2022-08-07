"""Merged hierarchy with deleted migrations

Revision ID: 323ae9fef193
Revises: 4d87c394a209, aa547260b23a
Create Date: 2022-08-07 21:11:15.364546+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "323ae9fef193"
down_revision = ("4d87c394a209", "aa547260b23a")
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
