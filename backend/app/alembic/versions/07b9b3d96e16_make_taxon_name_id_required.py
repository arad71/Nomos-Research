"""make informal_group taxon_name_id required

Revision ID: 07b9b3d96e16
Revises: 0cfd4ea02dc4
Create Date: 2022-07-27 15:09:14.804847+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "07b9b3d96e16"
down_revision = "0cfd4ea02dc4"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "informal_group", "taxon_name_id", existing_type=sa.INTEGER(), nullable=False
    )


def downgrade():
    op.alter_column(
        "informal_group", "taxon_name_id", existing_type=sa.INTEGER(), nullable=True
    )
