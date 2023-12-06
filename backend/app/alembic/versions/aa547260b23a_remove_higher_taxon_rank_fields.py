"""Remove higher taxon rank fields

Revision ID: aa547260b23a
Revises: e2b028e7474b
Create Date: 2022-08-05 09:52:54.728059+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "aa547260b23a"
down_revision = "4d87c394a209"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_index("ix_taxon_name_family", table_name="taxon_name")
    op.drop_index("ix_taxon_name_genus", table_name="taxon_name")
    op.drop_index("ix_taxon_name_species", table_name="taxon_name")
    op.drop_index("ix_taxon_name_subgenus", table_name="taxon_name")
    op.drop_index("ix_taxon_name_subspecies", table_name="taxon_name")
    op.drop_column("taxon_name", "family")
    op.drop_column("taxon_name", "species")
    op.drop_column("taxon_name", "subspecies")
    op.drop_column("taxon_name", "genus")
    op.drop_column("taxon_name", "subgenus")
    op.drop_column("taxon_name", "phylum")
    op.drop_column("taxon_name", "class")
    op.drop_column("taxon_name", "order")


def downgrade():
    op.add_column(
        "taxon_name",
        sa.Column("order", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("class", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("phylum", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("subgenus", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("genus", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("subspecies", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("species", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column("family", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.create_index(
        "ix_taxon_name_subspecies", "taxon_name", ["subspecies"], unique=False
    )
    op.create_index("ix_taxon_name_subgenus", "taxon_name", ["subgenus"], unique=False)
    op.create_index("ix_taxon_name_species", "taxon_name", ["species"], unique=False)
    op.create_index("ix_taxon_name_genus", "taxon_name", ["genus"], unique=False)
    op.create_index("ix_taxon_name_family", "taxon_name", ["family"], unique=False)
