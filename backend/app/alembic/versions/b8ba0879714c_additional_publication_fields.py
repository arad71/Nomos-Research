"""Additional Publication Fields.

Revision ID: b8ba0879714c
Revises: f8483ba996fa
Create Date: 2022-02-13 20:08:25.047879-08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "b8ba0879714c"
down_revision = "f8483ba996fa"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "publication_author",
        sa.Column("publication_id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["author_id"],
            ["author.author_id"],
        ),
        sa.ForeignKeyConstraint(
            ["publication_id"],
            ["publication.publication_id"],
        ),
        sa.PrimaryKeyConstraint("publication_id", "author_id"),
    )
    op.add_column(
        "publication", sa.Column("abbreviated_title", sa.String(), nullable=True)
    )
    op.add_column("publication", sa.Column("bhl_url", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("citation", sa.String(), nullable=True))
    op.add_column(
        "publication", sa.Column("citation_author_year", sa.String(), nullable=True)
    )
    op.add_column("publication", sa.Column("citation_html", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("display_title", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("doi", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("duplicate_of", sa.Integer(), nullable=True))
    op.add_column("publication", sa.Column("edition", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("isbn", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("issn", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("language", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("notes", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("pages", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("parent", sa.Integer(), nullable=True))
    op.add_column(
        "publication", sa.Column("publication_date", sa.String(), nullable=True)
    )
    op.add_column("publication", sa.Column("published", sa.Boolean(), nullable=True))
    op.add_column(
        "publication", sa.Column("published_location", sa.String(), nullable=True)
    )
    op.add_column("publication", sa.Column("publisher", sa.String(), nullable=True))
    op.add_column(
        "publication", sa.Column("reference_author_role", sa.String(), nullable=True)
    )
    op.add_column(
        "publication", sa.Column("reference_type", sa.String(), nullable=True)
    )
    op.add_column("publication", sa.Column("title", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("tl2", sa.String(), nullable=True))
    op.add_column(
        "publication", sa.Column("verbatim_author", sa.String(), nullable=True)
    )
    op.add_column(
        "publication", sa.Column("verbatim_citation", sa.String(), nullable=True)
    )
    op.add_column(
        "publication", sa.Column("verbatim_reference", sa.String(), nullable=True)
    )
    op.add_column("publication", sa.Column("volume", sa.String(), nullable=True))
    op.add_column("publication", sa.Column("year", sa.Integer(), nullable=True))


def downgrade():
    op.drop_column("publication", "year")
    op.drop_column("publication", "volume")
    op.drop_column("publication", "verbatim_reference")
    op.drop_column("publication", "verbatim_citation")
    op.drop_column("publication", "verbatim_author")
    op.drop_column("publication", "tl2")
    op.drop_column("publication", "title")
    op.drop_column("publication", "reference_type")
    op.drop_column("publication", "reference_author_role")
    op.drop_column("publication", "publisher")
    op.drop_column("publication", "published_location")
    op.drop_column("publication", "published")
    op.drop_column("publication", "publication_date")
    op.drop_column("publication", "parent")
    op.drop_column("publication", "pages")
    op.drop_column("publication", "notes")
    op.drop_column("publication", "language")
    op.drop_column("publication", "issn")
    op.drop_column("publication", "isbn")
    op.drop_column("publication", "edition")
    op.drop_column("publication", "duplicate_of")
    op.drop_column("publication", "doi")
    op.drop_column("publication", "display_title")
    op.drop_column("publication", "citation_html")
    op.drop_column("publication", "citation_author_year")
    op.drop_column("publication", "citation")
    op.drop_column("publication", "bhl_url")
    op.drop_column("publication", "abbreviated_title")
    op.drop_table("publication_author")
