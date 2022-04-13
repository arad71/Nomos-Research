"""Move Uninomial field.

Revision ID: 1c5d80976f40
Revises: b954fb86cb91
Create Date: 2022-04-10 23:46:10.715743-07:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "1c5d80976f40"
down_revision = "b954fb86cb91"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("taxon_name", "uninomial")
    op.add_column("taxon_rank", sa.Column("uninomial", sa.Boolean(), nullable=True))
    op.execute("    UPDATE taxon_rank SET uninomial = FALSE")
    op.alter_column("taxon_rank", "uninomial", nullable=True)


def downgrade():
    op.drop_column("taxon_rank", "uninomial")
    op.add_column(
        "taxon_name",
        sa.Column("uninomial", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
