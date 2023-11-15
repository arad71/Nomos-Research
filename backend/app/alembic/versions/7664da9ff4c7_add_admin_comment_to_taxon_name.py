"""Add admin_comment to taxon_name

Revision ID: 7664da9ff4c7
Revises: 015e61499a44
Create Date: 2022-06-10 08:17:30.350834+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "7664da9ff4c7"
down_revision = "015e61499a44"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("taxon_name", sa.Column("admin_comment", sa.String(), nullable=True))


def downgrade():
    op.drop_column("taxon_name", "admin_comment")
