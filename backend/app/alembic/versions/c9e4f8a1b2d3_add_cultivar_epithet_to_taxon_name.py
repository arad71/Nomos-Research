"""add cultivar epithet to taxon_name

Revision ID: c9e4f8a1b2d3
Revises: 22e897ac064b
Create Date: 2026-05-14 09:55:00.000000+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "c9e4f8a1b2d3"
down_revision = "22e897ac064b"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def index_exists(table_name, index_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return index_name in [idx["name"] for idx in inspector.get_indexes(table_name)]


def upgrade():
    if not column_exists("taxon_name", "cultivar_epithet"):
        op.add_column(
            "taxon_name",
            sa.Column("cultivar_epithet", sa.String(length=100), nullable=True),
        )

    if not index_exists("taxon_name", "ix_taxon_name_cultivar_epithet"):
        op.create_index(
            "ix_taxon_name_cultivar_epithet",
            "taxon_name",
            ["cultivar_epithet"],
            unique=False,
        )

    if not index_exists("taxon_name", "ix_taxon_name_has_cultivar"):
        op.create_index(
            "ix_taxon_name_has_cultivar",
            "taxon_name",
            [
                sa.text(
                    "(cultivar_epithet IS NOT NULL AND "
                    "length(trim(cultivar_epithet)) > 0)"
                )
            ],
            unique=False,
        )


def downgrade():
    if index_exists("taxon_name", "ix_taxon_name_has_cultivar"):
        op.drop_index("ix_taxon_name_has_cultivar", table_name="taxon_name")

    if index_exists("taxon_name", "ix_taxon_name_cultivar_epithet"):
        op.drop_index("ix_taxon_name_cultivar_epithet", table_name="taxon_name")

    if column_exists("taxon_name", "cultivar_epithet"):
        op.drop_column("taxon_name", "cultivar_epithet")
