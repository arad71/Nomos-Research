""" Add table and column comments.

Revision ID: 6c2551b100fc
Revises: a61b3b720423
Create Date: 2022-03-15 05:56:41.672526-07:00

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
        comment="Open Researcher and Contributor ID.",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
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
        comment="The type of author entry",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "author_order",
        existing_type=sa.INTEGER(),
        comment="The order in which authors should appear. The value itself is meaningless and serves solely as part of an ORDER BY clause when assembling the citation.",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "citation",
        "A list of all authors associated with this name,  including basionym / original authors and editors",
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
        existing_server_default=sa.text(
            "nextval('classification_system_classification_system_id_seq'::regclass)"
        ),
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
        comment="The type of classification system: INFORMAL - non-hierarchical informal grouping; HIERARCHICAL - a formal hierarchical grouping ",
        existing_nullable=False,
    )
    op.alter_column(
        "classification_system",
        "preferred",
        existing_type=postgresql.ENUM(
            "y", "n", "subf", name="classification_system__preferred"
        ),
        comment="Because a taxon can belong to more than one group this field provides a mechanism choosing a single preferred group ",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "sort_order",
        existing_type=sa.INTEGER(),
        comment="An optional value to sort the order classification system categories",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "classification_system",
        "The hierarchical classification systems supported within the WA Herbarium",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "cross_reference",
        "cross_reference_id",
        existing_type=sa.INTEGER(),
        comment="The unique record number for this cross-reference",
        existing_nullable=False,
        autoincrement=True,
    )
    op.alter_column(
        "cross_reference",
        "old_name_id",
        existing_type=sa.INTEGER(),
        comment="The old NameID, or NameID this reference is about",
        existing_nullable=False,
    )
    op.alter_column(
        "cross_reference",
        "new_name_id",
        existing_type=sa.INTEGER(),
        comment="The new NameID, or the NameID of the name this reference points to",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "cross_reference_type",
        existing_type=postgresql.ENUM(
            "ogv",
            "exc",
            "mis",
            "tsy",
            "nsy",
            "con",
            "forma",
            "err",
            "isy",
            name="cross_reference__cross_reference_type",
        ),
        comment="The type of cross-reference",
        existing_nullable=False,
    )
    op.alter_column(
        "cross_reference",
        "active",
        existing_type=postgresql.ENUM("y", "n", "subf", name="cross_reference__active"),
        comment="Flag indicating if this reference is active or not",
        existing_nullable=False,
    )
    op.alter_column(
        "cross_reference",
        "authorised_date",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date of authorisation",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "authorised_by",
        existing_type=sa.VARCHAR(length=60),
        comment="The person who authorised this cross-reference",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "comments",
        existing_type=sa.VARCHAR(length=1000),
        comment="Other informative comments about the cross-reference",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "cross_reference",
        "All active and non-active transactions which change the usage of a name, usually resulting in a reference to one or more other taxa ",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "hierarchy",
        "taxon_name_id",
        existing_type=sa.INTEGER(),
        comment="Unique identifier for name",
        existing_nullable=False,
    )
    op.alter_column(
        "hierarchy",
        "classification_system_id",
        existing_type=sa.INTEGER(),
        comment="The taxonomic classification system used for this parentage",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "parent_nid",
        existing_type=sa.INTEGER(),
        comment="Parent NameID of this taxon name",
        existing_nullable=False,
    )
    op.alter_column(
        "hierarchy",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "hierarchy",
        "This table indicates the parentage of each name",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "informal_group",
        "classification_system_id",
        existing_type=sa.INTEGER(),
        comment="The taxonomic classification system used for this parentage (non-hierarchical)",
        existing_nullable=True,
    )
    op.alter_column(
        "informal_group",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "informal_group",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "informal_group",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "informal_group",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "informal_group",
        "The various informal groups through which names can be classified",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "kingdom",
        "kingdom_id",
        existing_type=sa.INTEGER(),
        comment="The ID of this kingdom",
        existing_nullable=False,
        autoincrement=True,
        existing_server_default=sa.text("nextval('kingdom_kingdom_id_seq'::regclass)"),
    )
    op.alter_column(
        "kingdom",
        "kingdom_name",
        existing_type=sa.VARCHAR(length=15),
        comment="The name of this kingdom",
        existing_nullable=False,
    )
    op.alter_column(
        "kingdom",
        "kingdom_desc",
        existing_type=sa.VARCHAR(length=200),
        comment="A description of this kingdom",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "kingdom", "The various kingdoms", existing_comment=None, schema=None
    )
    op.alter_column(
        "publication",
        "publication_id",
        existing_type=sa.INTEGER(),
        comment="The unique ID of this publication.",
        existing_nullable=False,
        autoincrement=True,
        existing_server_default=sa.text(
            "nextval('publication_publication_id_seq'::regclass)"
        ),
    )
    op.alter_column(
        "publication",
        "bad_publication",
        existing_type=postgresql.ENUM(
            "y", "n", "subf", name="publication__bad_publication"
        ),
        comment="Flag indicating if this is a bad publication which should be ignored in reports",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "publication",
        "This table stores information on each publication cited within references",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "taxon_name",
        "taxon_name_id",
        existing_type=sa.INTEGER(),
        comment="Unique identifier for name",
        existing_nullable=False,
        autoincrement=True,
        existing_server_default=sa.text(
            "nextval('taxon_name_taxon_name_id_seq'::regclass)"
        ),
    )
    op.alter_column(
        "taxon_name",
        "kingdom_id",
        existing_type=sa.INTEGER(),
        comment="Kingdom this name belongs to. A derived field",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "rank_id",
        existing_type=sa.INTEGER(),
        comment="The rank ID of this name",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "rank_name",
        existing_type=sa.VARCHAR(length=15),
        comment="A duplicate of the rankname field in HBTRanks. To aid performance.",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "publication_id",
        existing_type=sa.INTEGER(),
        comment="The publication ID of the publication this name was published in",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "volume_information",
        existing_type=sa.VARCHAR(length=100),
        comment="The volume information of the publication this name was published in",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "publication_year",
        existing_type=sa.INTEGER(),
        comment="The year of publication",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "is_current",
        existing_type=postgresql.ENUM("y", "n", "subf", name="taxon_name__is_current"),
        comment="Current status, Y = current, N = not current",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "origin",
        existing_type=sa.VARCHAR(length=1),
        comment="Flag indicating whether taxon has been naturalised in Western Australia. * = naturalised",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "informal",
        existing_type=sa.VARCHAR(length=2),
        comment="Flag indicating whether name is used informally but not yet formally published",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "form_desc_yr",
        existing_type=sa.INTEGER(),
        comment="Year of date the taxon formally described",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "form_desc_mn",
        existing_type=sa.INTEGER(),
        comment="Month of date formally described",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "form_desc_dy",
        existing_type=sa.INTEGER(),
        comment="Day of date formally described",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "comments",
        existing_type=sa.VARCHAR(length=1000),
        comment="Comments about name",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "contributed_by",
        existing_type=sa.VARCHAR(length=16),
        comment="Person authorising entry of this name. This will be the name of a taxonomist who can vouch for the correctness of the record.",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "contributed_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="Date this entry was authorised on",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "validated",
        existing_type=postgresql.ENUM("y", "n", "subf", name="taxon_name__validated"),
        comment="Flag indicating whether record is validated or not. By default all records entered manually are validated, all records entered from an external source are unvalidated",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "source",
        existing_type=sa.VARCHAR(length=10),
        comment="A code representing an external source this record was derived from. eg. CAVP",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "external_id",
        existing_type=sa.VARCHAR(length=10),
        comment="An identifier associated with the external record (if one exists).",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "family_code",
        existing_type=sa.VARCHAR(length=5),
        comment="The family code of this name if it is of rank below family.This field has been retained for backward compatibility and because it is used as part of Herbarium curatorial procedures.",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "author",
        existing_type=sa.VARCHAR(length=180),
        comment="Derived field. Denormalised for performance reasons.",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "vernacular",
        existing_type=sa.VARCHAR(length=100),
        comment="Derived from HBTVErnaculars to aid performance and querying",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "is_eradicated",
        existing_type=sa.VARCHAR(length=1),
        comment='Nat Status is a superset of ORIGIN. See domain for values. "A" = old "*"',
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "naturalised_comments",
        existing_type=sa.VARCHAR(length=400),
        comment="Is this taxon definitely naturalised.Y = Yes N = there is some doubt whether it is really naturalised.",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "linear_sequence",
        existing_type=sa.INTEGER(),
        comment="If this is an alien, has it been eradicated?",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "family_nid",
        existing_type=sa.INTEGER(),
        comment="The NameID of the family that is a parent of this taxon",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "taxon_name",
        "All current and non-current taxon names at all levels of the hierarchy",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "taxon_rank",
        "kingdom_id",
        existing_type=sa.INTEGER(),
        comment="The kingdom ID this rank and its parentage applies to",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_rank",
        "rank_name",
        existing_type=sa.VARCHAR(length=15),
        comment="The ID of this rank",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_rank",
        "rank_abbrev",
        existing_type=postgresql.ENUM(
            "subsp",
            "nothovar",
            "cv",
            "var",
            "subvar",
            "forma",
            "subf",
            name="taxon_rank__rank_abbrev",
        ),
        comment="The rank abbreviation (generally for ranks below species)",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "direct_parent_rank_id",
        existing_type=sa.INTEGER(),
        comment="The direct parent of this rank",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "required_parent_rank_id",
        existing_type=sa.INTEGER(),
        comment="The mandatory, or required parent, of this rank",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "taxon_rank",
        "The ranks and their parentage",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "user",
        "email",
        existing_type=sa.VARCHAR(),
        comment="The email address of this user",
        existing_nullable=False,
    )
    op.alter_column(
        "user",
        "default_kingdom",
        existing_type=sa.INTEGER(),
        comment="The default kingdom this user will save taxon names with",
        existing_nullable=True,
    )
    op.alter_column(
        "user",
        "default_class",
        existing_type=sa.INTEGER(),
        comment="The default classification system this user will save taxon names with",
        existing_nullable=True,
    )
    op.create_table_comment(
        "user",
        "A list of users and their access rights",
        existing_comment=None,
        schema=None,
    )
    op.alter_column(
        "vernacular",
        "vernacular",
        existing_type=sa.VARCHAR(length=120),
        comment="A common name for this scientific name",
        existing_nullable=False,
    )
    op.alter_column(
        "vernacular",
        "taxon_name_id",
        existing_type=sa.INTEGER(),
        comment="The TaxonID for this name",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "language",
        existing_type=postgresql.ENUM(
            "english", "indigenous", name="vernacular__language"
        ),
        comment="The language of or origin of this name",
        existing_nullable=False,
    )
    op.alter_column(
        "vernacular",
        "lang_pref",
        existing_type=postgresql.ENUM("y", "n", "subf", name="vernacular__lang_pref"),
        comment="Type of name (EU=European, AB = Aboriginal)",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "preferred",
        existing_type=postgresql.ENUM("y", "n", "subf", name="vernacular__preferred"),
        comment="Flag indicating if this is the overall preferred vernacular name for this latin name",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "source",
        existing_type=sa.VARCHAR(length=50),
        comment="The source or contributor of this name",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "created_by",
        existing_type=sa.INTEGER(),
        comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment="The date this record was created on",
        existing_nullable=True,
    )
    op.create_table_comment(
        "vernacular",
        "The common or vernacular names recorded for Latin names, where they exist",
        existing_comment=None,
        schema=None,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table_comment(
        "vernacular",
        existing_comment="The common or vernacular names recorded for Latin names, where they exist",
        schema=None,
    )
    op.alter_column(
        "vernacular",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "source",
        existing_type=sa.VARCHAR(length=50),
        comment=None,
        existing_comment="The source or contributor of this name",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "preferred",
        existing_type=postgresql.ENUM("y", "n", "subf", name="vernacular__preferred"),
        comment=None,
        existing_comment="Flag indicating if this is the overall preferred vernacular name for this latin name",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "lang_pref",
        existing_type=postgresql.ENUM("y", "n", "subf", name="vernacular__lang_pref"),
        comment=None,
        existing_comment="Type of name (EU=European, AB = Aboriginal)",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "language",
        existing_type=postgresql.ENUM(
            "english", "indigenous", name="vernacular__language"
        ),
        comment=None,
        existing_comment="The language of or origin of this name",
        existing_nullable=False,
    )
    op.alter_column(
        "vernacular",
        "taxon_name_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The TaxonID for this name",
        existing_nullable=True,
    )
    op.alter_column(
        "vernacular",
        "vernacular",
        existing_type=sa.VARCHAR(length=120),
        comment=None,
        existing_comment="A common name for this scientific name",
        existing_nullable=False,
    )
    op.drop_table_comment(
        "user", existing_comment="A list of users and their access rights", schema=None
    )
    op.alter_column(
        "user",
        "default_class",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The default classification system this user will save taxon names with",
        existing_nullable=True,
    )
    op.alter_column(
        "user",
        "default_kingdom",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The default kingdom this user will save taxon names with",
        existing_nullable=True,
    )
    op.alter_column(
        "user",
        "email",
        existing_type=sa.VARCHAR(),
        comment=None,
        existing_comment="The email address of this user",
        existing_nullable=False,
    )
    op.drop_table_comment(
        "taxon_rank", existing_comment="The ranks and their parentage", schema=None
    )
    op.alter_column(
        "taxon_rank",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "required_parent_rank_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The mandatory, or required parent, of this rank",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "direct_parent_rank_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The direct parent of this rank",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "rank_abbrev",
        existing_type=postgresql.ENUM(
            "subsp",
            "nothovar",
            "cv",
            "var",
            "subvar",
            "forma",
            "subf",
            name="taxon_rank__rank_abbrev",
        ),
        comment=None,
        existing_comment="The rank abbreviation (generally for ranks below species)",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_rank",
        "rank_name",
        existing_type=sa.VARCHAR(length=15),
        comment=None,
        existing_comment="The ID of this rank",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_rank",
        "kingdom_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The kingdom ID this rank and its parentage applies to",
        existing_nullable=False,
    )
    op.drop_table_comment(
        "taxon_name",
        existing_comment="All current and non-current taxon names at all levels of the hierarchy",
        schema=None,
    )
    op.alter_column(
        "taxon_name",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "family_nid",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The NameID of the family that is a parent of this taxon",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "linear_sequence",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="If this is an alien, has it been eradicated?",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "naturalised_comments",
        existing_type=sa.VARCHAR(length=400),
        comment=None,
        existing_comment="Is this taxon definitely naturalised.Y = Yes N = there is some doubt whether it is really naturalised.",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "is_eradicated",
        existing_type=sa.VARCHAR(length=1),
        comment=None,
        existing_comment='Nat Status is a superset of ORIGIN. See domain for values. "A" = old "*"',
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "vernacular",
        existing_type=sa.VARCHAR(length=100),
        comment=None,
        existing_comment="Derived from HBTVErnaculars to aid performance and querying",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "author",
        existing_type=sa.VARCHAR(length=180),
        comment=None,
        existing_comment="Derived field. Denormalised for performance reasons.",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "family_code",
        existing_type=sa.VARCHAR(length=5),
        comment=None,
        existing_comment="The family code of this name if it is of rank below family.This field has been retained for backward compatibility and because it is used as part of Herbarium curatorial procedures.",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "external_id",
        existing_type=sa.VARCHAR(length=10),
        comment=None,
        existing_comment="An identifier associated with the external record (if one exists).",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "source",
        existing_type=sa.VARCHAR(length=10),
        comment=None,
        existing_comment="A code representing an external source this record was derived from. eg. CAVP",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "validated",
        existing_type=postgresql.ENUM("y", "n", "subf", name="taxon_name__validated"),
        comment=None,
        existing_comment="Flag indicating whether record is validated or not. By default all records entered manually are validated, all records entered from an external source are unvalidated",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "contributed_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="Date this entry was authorised on",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "contributed_by",
        existing_type=sa.VARCHAR(length=16),
        comment=None,
        existing_comment="Person authorising entry of this name. This will be the name of a taxonomist who can vouch for the correctness of the record.",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "comments",
        existing_type=sa.VARCHAR(length=1000),
        comment=None,
        existing_comment="Comments about name",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "form_desc_dy",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Day of date formally described",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "form_desc_mn",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Month of date formally described",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "form_desc_yr",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Year of date the taxon formally described",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "informal",
        existing_type=sa.VARCHAR(length=2),
        comment=None,
        existing_comment="Flag indicating whether name is used informally but not yet formally published",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "origin",
        existing_type=sa.VARCHAR(length=1),
        comment=None,
        existing_comment="Flag indicating whether taxon has been naturalised in Western Australia. * = naturalised",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "is_current",
        existing_type=postgresql.ENUM("y", "n", "subf", name="taxon_name__is_current"),
        comment=None,
        existing_comment="Current status, Y = current, N = not current",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "publication_year",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The year of publication",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "volume_information",
        existing_type=sa.VARCHAR(length=100),
        comment=None,
        existing_comment="The volume information of the publication this name was published in",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "publication_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The publication ID of the publication this name was published in",
        existing_nullable=True,
    )
    op.alter_column(
        "taxon_name",
        "rank_name",
        existing_type=sa.VARCHAR(length=15),
        comment=None,
        existing_comment="A duplicate of the rankname field in HBTRanks. To aid performance.",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "rank_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The rank ID of this name",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "kingdom_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Kingdom this name belongs to. A derived field",
        existing_nullable=False,
    )
    op.alter_column(
        "taxon_name",
        "taxon_name_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Unique identifier for name",
        existing_nullable=False,
        autoincrement=True,
        existing_server_default=sa.text(
            "nextval('taxon_name_taxon_name_id_seq'::regclass)"
        ),
    )
    op.drop_table_comment(
        "publication",
        existing_comment="This table stores information on each publication cited within references",
        schema=None,
    )
    op.alter_column(
        "publication",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "bad_publication",
        existing_type=postgresql.ENUM(
            "y", "n", "subf", name="publication__bad_publication"
        ),
        comment=None,
        existing_comment="Flag indicating if this is a bad publication which should be ignored in reports",
        existing_nullable=True,
    )
    op.alter_column(
        "publication",
        "publication_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The unique ID of this publication.",
        existing_nullable=False,
        autoincrement=True,
        existing_server_default=sa.text(
            "nextval('publication_publication_id_seq'::regclass)"
        ),
    )
    op.drop_table_comment(
        "kingdom", existing_comment="The various kingdoms", schema=None
    )
    op.alter_column(
        "kingdom",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "kingdom_desc",
        existing_type=sa.VARCHAR(length=200),
        comment=None,
        existing_comment="A description of this kingdom",
        existing_nullable=True,
    )
    op.alter_column(
        "kingdom",
        "kingdom_name",
        existing_type=sa.VARCHAR(length=15),
        comment=None,
        existing_comment="The name of this kingdom",
        existing_nullable=False,
    )
    op.alter_column(
        "kingdom",
        "kingdom_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The ID of this kingdom",
        existing_nullable=False,
        autoincrement=True,
        existing_server_default=sa.text("nextval('kingdom_kingdom_id_seq'::regclass)"),
    )
    op.drop_table_comment(
        "informal_group",
        existing_comment="The various informal groups through which names can be classified",
        schema=None,
    )
    op.alter_column(
        "informal_group",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "informal_group",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "informal_group",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "informal_group",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "informal_group",
        "classification_system_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The taxonomic classification system used for this parentage (non-hierarchical)",
        existing_nullable=True,
    )
    op.drop_table_comment(
        "hierarchy",
        existing_comment="This table indicates the parentage of each name",
        schema=None,
    )
    op.alter_column(
        "hierarchy",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "parent_nid",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Parent NameID of this taxon name",
        existing_nullable=False,
    )
    op.alter_column(
        "hierarchy",
        "classification_system_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The taxonomic classification system used for this parentage",
        existing_nullable=True,
    )
    op.alter_column(
        "hierarchy",
        "taxon_name_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="Unique identifier for name",
        existing_nullable=False,
    )
    op.drop_table_comment(
        "cross_reference",
        existing_comment="All active and non-active transactions which change the usage of a name, usually resulting in a reference to one or more other taxa ",
        schema=None,
    )
    op.alter_column(
        "cross_reference",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "comments",
        existing_type=sa.VARCHAR(length=1000),
        comment=None,
        existing_comment="Other informative comments about the cross-reference",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "authorised_by",
        existing_type=sa.VARCHAR(length=60),
        comment=None,
        existing_comment="The person who authorised this cross-reference",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "authorised_date",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date of authorisation",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "active",
        existing_type=postgresql.ENUM("y", "n", "subf", name="cross_reference__active"),
        comment=None,
        existing_comment="Flag indicating if this reference is active or not",
        existing_nullable=False,
    )
    op.alter_column(
        "cross_reference",
        "cross_reference_type",
        existing_type=postgresql.ENUM(
            "ogv",
            "exc",
            "mis",
            "tsy",
            "nsy",
            "con",
            "forma",
            "err",
            "isy",
            name="cross_reference__cross_reference_type",
        ),
        comment=None,
        existing_comment="The type of cross-reference",
        existing_nullable=False,
    )
    op.alter_column(
        "cross_reference",
        "new_name_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The new NameID, or the NameID of the name this reference points to",
        existing_nullable=True,
    )
    op.alter_column(
        "cross_reference",
        "old_name_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The old NameID, or NameID this reference is about",
        existing_nullable=False,
    )
    op.alter_column(
        "cross_reference",
        "cross_reference_id",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The unique record number for this cross-reference",
        existing_nullable=False,
        autoincrement=True,
    )
    op.drop_table_comment(
        "classification_system",
        existing_comment="The hierarchical classification systems supported within the WA Herbarium",
        schema=None,
    )
    op.alter_column(
        "classification_system",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
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
        existing_comment="Because a taxon can belong to more than one group this field provides a mechanism choosing a single preferred group ",
        existing_nullable=True,
    )
    op.alter_column(
        "classification_system",
        "class_type",
        existing_type=postgresql.ENUM(
            "informal", "hierarchical", name="classification_system__class_type"
        ),
        comment=None,
        existing_comment="The type of classification system: INFORMAL - non-hierarchical informal grouping; HIERARCHICAL - a formal hierarchical grouping ",
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
        existing_server_default=sa.text(
            "nextval('classification_system_classification_system_id_seq'::regclass)"
        ),
    )
    op.drop_table_comment(
        "citation",
        existing_comment="A list of all authors associated with this name,  including basionym / original authors and editors",
        schema=None,
    )
    op.alter_column(
        "citation",
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "citation",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
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
        existing_comment="The type of author entry",
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
        "created_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was created on",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "created_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who created this record",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "updated_on",
        existing_type=postgresql.TIMESTAMP(),
        comment=None,
        existing_comment="The date this record was updated on",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "updated_by",
        existing_type=sa.INTEGER(),
        comment=None,
        existing_comment="The person who updated this record",
        existing_nullable=True,
    )
    op.alter_column(
        "author",
        "orc_id",
        existing_type=sa.VARCHAR(length=255),
        comment=None,
        existing_comment="Open Researcher and Contributor ID.",
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
        existing_comment="First names of author",
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
    # ### end Alembic commands ###
