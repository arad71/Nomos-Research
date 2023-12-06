"""Add Legacy IDs and Unique Constraints.

Revision ID: 1f341cfdfd41
Revises: 818f176274a6
Create Date: 2022-03-15 19:26:09.178788-07:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "1f341cfdfd41"
down_revision = "818f176274a6"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("author", sa.Column("legacy_id_name", sa.String(), nullable=True))
    op.create_unique_constraint("uc_author_legacy_id", "author", ["legacy_id_name"])
    op.add_column("citation", sa.Column("legacy_id_name", sa.String(), nullable=True))
    op.create_unique_constraint(
        "uc_citation_legacy_id",
        "citation",
        ["legacy_id_name", "taxon_name_id", "author_type"],
    )
    op.add_column(
        "classification_system", sa.Column("legacy_id_name", sa.String(), nullable=True)
    )
    op.create_unique_constraint(
        "uc_classification_system_legacy_id",
        "classification_system",
        ["legacy_id_name"],
    )
    op.add_column(
        "cross_reference", sa.Column("legacy_id", sa.Integer(), nullable=True)
    )
    op.create_unique_constraint(
        "uc_cross_reference_legacy_id", "cross_reference", ["legacy_id"]
    )
    op.create_unique_constraint(
        "uc_informal_group_legacy_id",
        "informal_group",
        ["classification_system_id", "taxon_name_id"],
    )
    op.create_unique_constraint(
        "uc_hierarchy_legacy_id",
        "hierarchy",
        ["taxon_name_id", "classification_system_id"],
    )
    op.add_column("kingdom", sa.Column("legacy_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_kingdom_legacy_id"), "kingdom", ["legacy_id"], unique=True)
    op.create_unique_constraint("uc_kingdom_legacy_id", "kingdom", ["legacy_id"])
    op.add_column("publication", sa.Column("legacy_id", sa.Integer(), nullable=True))
    op.create_unique_constraint(
        "uc_publication_legacy_id", "publication", ["legacy_id"]
    )
    op.add_column("taxon_name", sa.Column("legacy_id", sa.Integer(), nullable=True))
    op.create_unique_constraint("uc_taxon_name_legacy_id", "taxon_name", ["legacy_id"])
    op.add_column("taxon_rank", sa.Column("legacy_id", sa.Integer(), nullable=True))
    op.create_unique_constraint(
        "uc_taxon_rank_legacy_id", "taxon_rank", ["legacy_id", "kingdom_id"]
    )
    op.add_column("user", sa.Column("legacy_id_name", sa.String(), nullable=True))
    op.create_unique_constraint("uc_user_legacy_id", "user", ["legacy_id_name"])
    op.create_unique_constraint(
        "uc_vernacular_legacy_id",
        "vernacular",
        ["taxon_name_id", "vernacular", "language"],
    )


def downgrade():
    op.drop_constraint("uc_user_legacy_id", "user", type_="unique")
    op.drop_column("user", "legacy_id_name")
    op.drop_constraint("uc_taxon_rank_legacy_id", "taxon_rank", type_="unique")
    op.drop_column("taxon_rank", "legacy_id")
    op.drop_constraint("uc_taxon_name_legacy_id", "taxon_name", type_="unique")
    op.drop_column("taxon_name", "legacy_id")
    op.drop_constraint("uc_publication_legacy_id", "publication", type_="unique")
    op.drop_column("publication", "legacy_id")
    op.drop_constraint("uc_kingdom_legacy_id", "kingdom", type_="unique")
    op.drop_index(op.f("ix_kingdom_legacy_id"), table_name="kingdom")
    op.drop_column("kingdom", "legacy_id")
    op.drop_constraint("uc_hierarchy_legacy_id", "hierarchy", type_="unique")
    op.drop_constraint("uc_informal_group_legacy_id", "informal_group", type_="unique")
    op.drop_constraint(
        "uc_cross_reference_legacy_id", "cross_reference", type_="unique"
    )
    op.drop_column("cross_reference", "legacy_id")
    op.drop_constraint(
        "uc_classification_system_legacy_id", "classification_system", type_="unique"
    )
    op.drop_column("classification_system", "legacy_id_name")
    op.drop_constraint("uc_citation_legacy_id", "citation", type_="unique")
    op.drop_column("citation", "legacy_id_name")
    op.drop_constraint("uc_author_legacy_id", "author", type_="unique")
    op.drop_column("author", "legacy_id_name")
    op.drop_constraint("uc_vernacular_legacy_id", "vernacular", type_="unique")
