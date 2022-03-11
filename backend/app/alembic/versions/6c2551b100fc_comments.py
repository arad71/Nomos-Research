""" Add table and column comments.

Revision ID: 6c2551b100fc
Revises: a61b3b720423
Create Date: 2022-03-03 18:50:02.621476-08:00

"""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = "6c2551b100fc"
down_revision = "a61b3b720423"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "author",
        "author",
        existing_type=sa.VARCHAR(length=30),
        comment="Standard Brummit and Powell abbreviation for this author",
        existing_nullable=False,
    )
    op.alter_column(
        "author",
        "surname",
        existing_type=sa.VARCHAR(length=30),
        comment="Surname of author",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "first_names",
        existing_type=sa.VARCHAR(length=60),
        comment="First names of author",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "initials",
        existing_type=sa.VARCHAR(length=30),
        comment="Author initials (excluding surname)",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "orc_id",
        existing_type=sa.VARCHAR(length=255),
        comment="Open Researcher and Contributor ID. ",
        existing_nullable=True,
    )
    op.create_table_comment(
        "author",
        "A list of all validly recognised authors.",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "citation",
        "taxon_name_id",
        existing_type=sa.INTEGER(),
        comment="Taxon Name ID this author applies to",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "author_type",
        existing_type=postgresql.ENUM(
            "basionym", "current", "editor", name="citation__author_type"
        ),
        comment="The type of author entry: BASIONYM, CURRENT, EDITOR",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "author_order",
        existing_type=sa.INTEGER(),
        comment="The order in which authors should appear. The value itself is meaningless and serves solely as part of an ORDER BY clause when assembling the citation.",
        existing_nullable=True,
    )
    op.create_table_comment(
        "citation",
        "A list of all authors associated with this name, including basionym authors and editors",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "classification_system",
        "classification_system_id",
        existing_type=sa.INTEGER(),
        comment="Primary key. The taxonomic classification system used for this parentage",
        existing_nullable=False,
        autoincrement=True,
    )
    op.alter_column(
        "classification_system",
        "class_desc",
        existing_type=sa.VARCHAR(length=200),
        comment="Description of classification system",
        existing_nullable=False,
    )
    op.alter_column(
        "classification_system",
        "class_type",
        existing_type=postgresql.ENUM(
            "informal", "hierarchical", name="classification_system__class_type"
        ),
        comment="The type of classification system: INFORMAL - non-hierarchical informal grouping; HIERARCHICAL - a formal hierarchical grouping",
        existing_nullable=False,
    )
    op.alter_column(
        "classification_system",
        "preferred",
        existing_type=postgresql.ENUM(
            "y", "n", "subf", name="classification_system__preferred"
        ),
        comment="Because a taxon can belong to more than one group this field provides a mechanism choosing a single preferred group",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "sort_order",
        existing_type=sa.INTEGER(),
        comment="An optional value to sort the order classification system categories",
        existing_nullable=True,
    )
    op.create_table_comment(
        "classification_system",
        "The hierarchical classification systems supported within the WA Herbarium",
        existing_comment=None,
        schema=None,
    )
    op.create_table_comment(
        "cross_reference",
        "All active and non-active transactions which change the usage of a name, usually resulting in a reference to one or more other taxa",
        existing_comment=None,
        schema=None,
    )
    op.create_table_comment(
        "hierarchy",
        "This table indicates the parentage of each name",
        existing_comment=None,
        schema=None,
    )
    op.create_table_comment(
        "informal_group",
        "The various informal groups through which names can be classified",
        existing_comment=None,
        schema=None,
    )
    op.create_table_comment(
        "kingdom", "The various kingdoms", existing_comment=None, schema=None
    )
    op.create_table_comment(
        "publication",
        "This table stores information on each publication cited within references",
        existing_comment=None,
        schema=None,
    )
    op.create_table_comment(
        "taxon_name",
        "All current and non-current taxon names at all levels of the hierarchy",
        existing_comment=None,
        schema=None,
    )
    op.create_table_comment(
        "taxon_rank",
        "The ranks and their parentage",
        existing_comment=None,
        schema=None,
    )
    op.create_table_comment(
        "user",
        "A list of users and their access rights",
        existing_comment=None,
        schema=None,
    )
    op.create_table_comment(
        "vernacular",
        "The common or vernacular names recorded for Latin names, where they exist",
        existing_comment=None,
        schema=None,
    )


def downgrade():
    op.drop_table_comment(
        "vernacular",
        existing_comment="The common or vernacular names recorded for Latin names, where they exist",
        schema=None,
    )
    op.drop_table_comment(
        "user", existing_comment="A list of users and their access rights", schema=None
    )
    op.drop_table_comment(
        "taxon_rank", existing_comment="The ranks and their parentage", schema=None
    )
    op.drop_table_comment(
        "taxon_name",
        existing_comment="All current and non-current taxon names at all levels of the hierarchy",
        schema=None,
    )
    op.drop_table_comment(
        "publication",
        existing_comment="This table stores information on each publication cited within references",
        schema=None,
    )
    op.drop_table_comment(
        "kingdom", existing_comment="The various kingdoms", schema=None
    )
    op.drop_table_comment(
        "informal_group",
        existing_comment="The various informal groups through which names can be classified",
        schema=None,
    )
    op.drop_table_comment(
        "hierarchy",
        existing_comment="This table indicates the parentage of each name",
        schema=None,
    )
    op.drop_table_comment(
        "cross_reference",
        existing_comment="All active and non-active transactions which change the usage of a name, usually resulting in a reference to one or more other taxa",
        schema=None,
    )
    op.drop_table_comment(
        "classification_system",
        existing_comment="The hierarchical classification systems supported within the WA Herbarium",
        schema=None,
    )
    op.alter_column(
        "classification_system",
        "sort_order",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="An optional value to sort the order classification system categories",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "preferred",
        existing_type=postgresql.ENUM(
            "y", "n", "subf", name="classification_system__preferred"
        ),
        comment=None,
        existing_comment="Because a taxon can belong to more than one group this field provides a mechanism choosing a single preferred group",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "class_type",
        existing_type=postgresql.ENUM(
            "informal", "hierarchical", name="classification_system__class_type"
        ),
        comment=None,
        existing_comment="The type of classification system: INFORMAL - non-hierarchical informal grouping; HIERARCHICAL - a formal hierarchical grouping",
        existing_nullable=False,
    )
    op.alter_column(
        "classification_system",
        "class_desc",
        existing_type=sa.VARCHAR(length=200),
        comment=None,
        existing_comment="Description of classification system",
        existing_nullable=False,
    )
    op.alter_column(
        "classification_system",
        "classification_system_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Primary key. The taxonomic classification system used for this parentage",
        existing_nullable=False,
        autoincrement=True,
    )
    op.drop_table_comment(
        "citation",
        existing_comment="A list of all authors associated with this name, including basionym authors and editors",
        schema=None,
    )
    op.alter_column(
        "citation",
        "author_order",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The order in which authors should appear. The value itself is meaningless and serves solely as part of an ORDER BY clause when assembling the citation.",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "author_type",
        existing_type=postgresql.ENUM(
            "basionym", "current", "editor", name="citation__author_type"
        ),
        comment=None,
        existing_comment="The type of author entry: BASIONYM, CURRENT, EDITOR",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "taxon_name_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Taxon Name ID this author applies to",
        existing_nullable=True,
    )
    op.drop_table_comment(
        "author",
        existing_comment="A list of all validly recognised authors.",
        schema=None,
    )
    op.alter_column(
        "author",
        "orc_id",
        existing_type=sa.VARCHAR(length=255),
        comment=None,
        existing_comment="Open Researcher and Contributor ID. ",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "initials",
        existing_type=sa.VARCHAR(length=30),
        comment=None,
        existing_comment="Author initials (excluding surname)",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "first_names",
        existing_type=sa.VARCHAR(length=60),
        comment=None,
        existing_comment="Standard Brummit and Powell abbreviation for this author",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "surname",
        existing_type=sa.VARCHAR(length=30),
        comment=None,
        existing_comment="Surname of author",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "author",
        existing_type=sa.VARCHAR(length=30),
        comment=None,
        existing_comment="Standard Brummit and Powell abbreviation for this author",
        existing_nullable=False,
    )
