"""Remove display_title from publication

Revision ID: 36aa968a7287
Revises: f766633341be
Create Date: 2022-06-21 08:39:00.238567+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "36aa968a7287"
down_revision = "f766633341be"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("publication", "display_title")


def downgrade():
    op.add_column("publication", sa.Column("display_title", sa.String(), nullable=True))
