"""Add parallel name override fields to taxon name

Revision ID: a1d2c3e4f5b6
Revises: 9d4e5f6a7b8c
Create Date: 2026-04-03 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a1d2c3e4f5b6"
down_revision = "9d4e5f6a7b8c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "taxon_name",
        sa.Column("parallel_override_uninomial", sa.String(), nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("parallel_override_specific_epithet", sa.String(length=70), nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("parallel_override_infraspecific_epithet", sa.String(length=70), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("taxon_name", "parallel_override_infraspecific_epithet")
    op.drop_column("taxon_name", "parallel_override_specific_epithet")
    op.drop_column("taxon_name", "parallel_override_uninomial")
