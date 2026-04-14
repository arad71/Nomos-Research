"""Seed parallel name fields from current values

Revision ID: b2c3d4e5f6a7
Revises: a1d2c3e4f5b6
Create Date: 2026-04-03 14:45:00.000000
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "b2c3d4e5f6a7"
down_revision = "a1d2c3e4f5b6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        UPDATE taxon_name
        SET
            parallel_override_uninomial = COALESCE(parallel_override_uninomial, uninomial),
            parallel_override_specific_epithet = COALESCE(parallel_override_specific_epithet, specific_epithet),
            parallel_override_infraspecific_epithet = COALESCE(parallel_override_infraspecific_epithet, infraspecific_epithet)
        WHERE deleted = FALSE
        """)


def downgrade() -> None:
    pass
