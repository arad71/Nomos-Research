"""clear animal kingdom rank abbreviations

Rank abbreviations are not supposed to be displayed for taxa in the Animal kingdom.
This migration removes all abbreviations from the taxon rank table for Animalia ranks.

Revision ID: 348210746c9b
Revises: c75e0df2cabf
Create Date: 2023-08-21 12:45:10.170353+08:00

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "348210746c9b"
down_revision = "c75e0df2cabf"
branch_labels = None
depends_on = None
subquery = "SELECT kingdom_id FROM kingdom WHERE kingdom_name IN ('Animalia')"


def upgrade():
    # Deletes all rank abbreviations for ranks in the animal kingdom
    op.execute(
        f"UPDATE taxon_rank SET rank_abbrev = null WHERE kingdom_id IN ({subquery})"
    )


def downgrade():
    # No script created for reverting the deletion of animal kingdom rank abbreviations
    pass
