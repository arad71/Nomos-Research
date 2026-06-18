"""Add legacy taxon name values

Revision ID: f2a3b4c5d6e7
Revises: e1b2c3d4f5a6
Create Date: 2026-06-18 00:00:00.000000+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "f2a3b4c5d6e7"
down_revision = "e1b2c3d4f5a6"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def upgrade():
    if not column_exists("taxon_name", "legacy_canonical_name"):
        op.add_column(
            "taxon_name",
            sa.Column("legacy_canonical_name", sa.String(), nullable=True),
        )
        op.create_index(
            op.f("ix_taxon_name_legacy_canonical_name"),
            "taxon_name",
            ["legacy_canonical_name"],
            unique=False,
        )

    if not column_exists("taxon_name", "legacy_scientific_name"):
        op.add_column(
            "taxon_name",
            sa.Column("legacy_scientific_name", sa.String(), nullable=True),
        )
        op.create_index(
            op.f("ix_taxon_name_legacy_scientific_name"),
            "taxon_name",
            ["legacy_scientific_name"],
            unique=False,
        )

    op.execute(
        """
        UPDATE taxon_name
        SET
            legacy_canonical_name = COALESCE(legacy_canonical_name, canonical_name),
            legacy_scientific_name = COALESCE(legacy_scientific_name, scientific_name)
        WHERE legacy_canonical_name IS NULL
           OR legacy_scientific_name IS NULL
        """
    )


def downgrade():
    if column_exists("taxon_name", "legacy_scientific_name"):
        op.drop_index(
            op.f("ix_taxon_name_legacy_scientific_name"),
            table_name="taxon_name",
        )
        op.drop_column("taxon_name", "legacy_scientific_name")

    if column_exists("taxon_name", "legacy_canonical_name"):
        op.drop_index(
            op.f("ix_taxon_name_legacy_canonical_name"),
            table_name="taxon_name",
        )
        op.drop_column("taxon_name", "legacy_canonical_name")
