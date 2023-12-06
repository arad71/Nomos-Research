"""Add publication_month

Revision ID: 787145148bc4
Revises: 6145ad7b7645
Create Date: 2022-05-25 10:30:25.655766+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "787145148bc4"
down_revision = "6145ad7b7645"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("publication", sa.Column("publication_month", sa.Integer()))


def downgrade():
    op.drop_column("publication", "publication_month")
