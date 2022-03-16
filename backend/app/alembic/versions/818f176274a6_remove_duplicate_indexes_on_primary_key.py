"""Remove duplicate indexes on primary key.

Revision ID: 818f176274a6
Revises: 6c2551b100fc
Create Date: 2022-03-15 19:04:25.273486-07:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "818f176274a6"
down_revision = "6c2551b100fc"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_index("ix_author_author_id", table_name="author")
    op.drop_index("ix_citation_citation_id", table_name="citation")
    op.drop_index(
        "ix_classification_system_classification_system_id",
        table_name="classification_system",
    )
    op.drop_index("ix_cross_reference_cross_reference_id", table_name="cross_reference")
    op.drop_index("ix_hierarchy_hierarchy_id", table_name="hierarchy")
    op.drop_index("ix_informal_group_informal_group_id", table_name="informal_group")
    op.drop_index("ix_kingdom_kingdom_id", table_name="kingdom")
    op.drop_index("ix_publication_publication_id", table_name="publication")
    op.drop_index("ix_taxon_name_taxon_name_id", table_name="taxon_name")
    op.drop_index("ix_taxon_rank_taxon_rank_id", table_name="taxon_rank")
    op.drop_index("ix_user_user_id", table_name="user")
    op.drop_index("ix_vernacular_vernacular_id", table_name="vernacular")


def downgrade():
    op.create_index(
        "ix_vernacular_vernacular_id", "vernacular", ["vernacular_id"], unique=False
    )
    op.create_index("ix_user_user_id", "user", ["user_id"], unique=False)
    op.create_index(
        "ix_taxon_rank_taxon_rank_id", "taxon_rank", ["taxon_rank_id"], unique=False
    )
    op.create_index(
        "ix_taxon_name_taxon_name_id", "taxon_name", ["taxon_name_id"], unique=False
    )
    op.create_index(
        "ix_publication_publication_id", "publication", ["publication_id"], unique=False
    )
    op.create_index("ix_kingdom_kingdom_id", "kingdom", ["kingdom_id"], unique=False)
    op.create_index(
        "ix_informal_group_informal_group_id",
        "informal_group",
        ["informal_group_id"],
        unique=False,
    )
    op.create_index(
        "ix_hierarchy_hierarchy_id", "hierarchy", ["hierarchy_id"], unique=False
    )
    op.create_index(
        "ix_cross_reference_cross_reference_id",
        "cross_reference",
        ["cross_reference_id"],
        unique=False,
    )
    op.create_index(
        "ix_classification_system_classification_system_id",
        "classification_system",
        ["classification_system_id"],
        unique=False,
    )
    op.create_index(
        "ix_citation_citation_id", "citation", ["citation_id"], unique=False
    )
    op.create_index("ix_author_author_id", "author", ["author_id"], unique=False)
