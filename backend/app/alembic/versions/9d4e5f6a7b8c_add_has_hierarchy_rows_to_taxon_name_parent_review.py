"""Add has_hierarchy_rows to taxon name parent review

Revision ID: 9d4e5f6a7b8c
Revises: 8c2f1d4e5a6b
Create Date: 2026-04-03
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9d4e5f6a7b8c"
down_revision = "8c2f1d4e5a6b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "taxon_name_parent_review",
        sa.Column("has_hierarchy_rows", sa.Boolean(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("taxon_name_parent_review", "has_hierarchy_rows")
