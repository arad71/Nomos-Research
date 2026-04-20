"""Add hybrid fields to taxon name

Revision ID: 4f3c2d1b8a77
Revises: 19d9f1a8b7c3
Create Date: 2026-04-02 18:55:00.000000+08:00

"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "4f3c2d1b8a77"
down_revision = "19d9f1a8b7c3"
branch_labels = None
depends_on = None


hybrid_category_enum = postgresql.ENUM(
    "named_hybrid",
    "hybrid_formula",
    "intergrade",
    name="taxon_name__hybrid_category",
)


def upgrade():
    hybrid_category_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "taxon_name",
        sa.Column(
            "is_hybrid",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
            comment="Flag indicating whether this taxon name should follow hybrid naming rules.",
        ),
    )
    op.add_column(
        "taxon_name",
        sa.Column(
            "hybrid_category",
            hybrid_category_enum,
            nullable=True,
            comment="Hybrid construction category used to drive deterministic name behaviour.",
        ),
    )


def downgrade():
    op.drop_column("taxon_name", "hybrid_category")
    op.drop_column("taxon_name", "is_hybrid")
    hybrid_category_enum.drop(op.get_bind(), checkfirst=True)
