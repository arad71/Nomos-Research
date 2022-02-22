"""Add foreign keys.

Revision ID: df49e076f774
Revises: 996fab16cdfa
Create Date: 2022-02-16 19:32:46.946575-08:00

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "df49e076f774"
down_revision = "996fab16cdfa"
branch_labels = None
depends_on = None


def upgrade():
    op.create_foreign_key(
        None, "citation", "taxon_name", ["taxon_name_id"], ["taxon_name_id"]
    )
    op.create_foreign_key(None, "citation", "author", ["author_id"], ["author_id"])
    op.create_foreign_key(
        None,
        "cross_reference",
        "cross_reference",
        ["old_name_id"],
        ["cross_reference_id"],
    )
    op.create_foreign_key(
        None,
        "cross_reference",
        "cross_reference",
        ["new_name_id"],
        ["cross_reference_id"],
    )
    op.create_foreign_key(
        None, "hierarchy", "taxon_name", ["taxon_name_id"], ["taxon_name_id"]
    )
    op.create_foreign_key(
        None, "hierarchy", "taxon_name", ["parent_nid"], ["taxon_name_id"]
    )
    op.create_foreign_key(
        None,
        "hierarchy",
        "classification_system",
        ["classification_system_id"],
        ["classification_system_id"],
    )
    op.create_foreign_key(
        None,
        "informal_group",
        "classification_system",
        ["classification_system_id"],
        ["classification_system_id"],
    )
    op.create_foreign_key(
        None, "informal_group", "taxon_name", ["taxon_name_id"], ["taxon_name_id"]
    )
    op.create_foreign_key(
        None, "publication", "publication", ["duplicate_of"], ["publication_id"]
    )
    op.create_foreign_key(
        None, "publication", "publication", ["parent"], ["publication_id"]
    )
    op.create_foreign_key(
        None, "taxon_name", "taxon_name", ["family_nid"], ["taxon_name_id"]
    )
    op.create_foreign_key(
        None, "taxon_name", "publication", ["publication_id"], ["publication_id"]
    )
    op.create_foreign_key(None, "taxon_name", "kingdom", ["kingdom_id"], ["kingdom_id"])
    op.create_foreign_key(
        None, "taxon_name", "taxon_rank", ["rank_id"], ["taxon_rank_id"]
    )
    op.create_foreign_key(None, "taxon_rank", "kingdom", ["kingdom_id"], ["kingdom_id"])
    op.create_foreign_key(
        None, "taxon_rank", "taxon_rank", ["required_parent_rank_id"], ["taxon_rank_id"]
    )
    op.create_foreign_key(
        None, "vernacular", "taxon_name", ["taxon_name_id"], ["taxon_name_id"]
    )


def downgrade():
    op.drop_constraint(None, "vernacular", type_="foreignkey")
    op.drop_constraint(None, "taxon_rank", type_="foreignkey")
    op.drop_constraint(None, "taxon_rank", type_="foreignkey")
    op.drop_constraint(None, "taxon_name", type_="foreignkey")
    op.drop_constraint(None, "taxon_name", type_="foreignkey")
    op.drop_constraint(None, "taxon_name", type_="foreignkey")
    op.drop_constraint(None, "taxon_name", type_="foreignkey")
    op.drop_constraint(None, "publication", type_="foreignkey")
    op.drop_constraint(None, "publication", type_="foreignkey")
    op.drop_constraint(None, "informal_group", type_="foreignkey")
    op.drop_constraint(None, "informal_group", type_="foreignkey")
    op.drop_constraint(None, "hierarchy", type_="foreignkey")
    op.drop_constraint(None, "hierarchy", type_="foreignkey")
    op.drop_constraint(None, "hierarchy", type_="foreignkey")
    op.drop_constraint(None, "cross_reference", type_="foreignkey")
    op.drop_constraint(None, "cross_reference", type_="foreignkey")
    op.drop_constraint(None, "citation", type_="foreignkey")
    op.drop_constraint(None, "citation", type_="foreignkey")
