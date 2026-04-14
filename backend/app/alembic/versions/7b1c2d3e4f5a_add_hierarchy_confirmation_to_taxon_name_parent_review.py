"""Add hierarchy confirmation to taxon name parent review

Revision ID: 7b1c2d3e4f5a
Revises: 6a8d9b0c1e2f
Create Date: 2026-04-02 23:45:00.000000+08:00

"""

import sqlalchemy as sa

from alembic import op

revision = "7b1c2d3e4f5a"
down_revision = "6a8d9b0c1e2f"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "taxon_name_parent_review",
        sa.Column(
            "hierarchy_confirmed",
            sa.Boolean(),
            nullable=True,
            comment="Whether the current linked or candidate parent is confirmed by hierarchy data",
        ),
    )
    op.add_column(
        "taxon_name_parent_review",
        sa.Column(
            "hierarchy_confirmation_note",
            sa.String(length=255),
            nullable=True,
            comment="Summary of hierarchy-based confirmation for the current row",
        ),
    )


def downgrade():
    op.drop_column("taxon_name_parent_review", "hierarchy_confirmation_note")
    op.drop_column("taxon_name_parent_review", "hierarchy_confirmed")
