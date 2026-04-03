"""Add infrageneric confirmation to taxon name parent review

Revision ID: 8c2f1d4e5a6b
Revises: 7b1c2d3e4f5a
Create Date: 2026-04-03 10:15:00.000000+08:00

"""

from alembic import op
import sqlalchemy as sa


revision = "8c2f1d4e5a6b"
down_revision = "7b1c2d3e4f5a"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "taxon_name_parent_review",
        sa.Column(
            "infrageneric_confirmed",
            sa.Boolean(),
            nullable=True,
            comment=(
                "Whether a bracketed infrageneric segment in the scientific "
                "name matches a subgenus signal in Nomos"
            ),
        ),
    )
    op.add_column(
        "taxon_name_parent_review",
        sa.Column(
            "infrageneric_confirmation_note",
            sa.String(length=255),
            nullable=True,
            comment="Summary of bracketed scientific-name matching against subgenus data",
        ),
    )


def downgrade():
    op.drop_column("taxon_name_parent_review", "infrageneric_confirmation_note")
    op.drop_column("taxon_name_parent_review", "infrageneric_confirmed")
