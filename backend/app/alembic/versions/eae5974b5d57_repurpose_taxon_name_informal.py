"""Repurpose Taxon Name - Informal.

Revision ID: eae5974b5d57
Revises: 3c31cbd94af9
Create Date: 2022-04-07 21:52:45.442899-07:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "eae5974b5d57"
down_revision = "3c31cbd94af9"
branch_labels = None
depends_on = None


def upgrade():
    publication_status_vals = ("published", "manuscript_name", "phrase_name")
    publication_status_enum = sa.Enum(
        *publication_status_vals, name="taxon_name__publication_status"
    )
    publication_status_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "taxon_name",
        sa.Column("publication_status", publication_status_enum, nullable=True),
    )
    op.execute(
        "UPDATE taxon_name tn SET publication_status=subquery.informal FROM ("
        "SELECT ("
        "CASE "
        "WHEN informal = 'MS' THEN 'manuscript_name'::taxon_name__publication_status "
        "WHEN informal = 'PN' THEN 'phrase_name'::taxon_name__publication_status "
        "WHEN informal is null THEN 'published'::taxon_name__publication_status "
        "END) as informal, "
        "taxon_name_id "
        "FROM taxon_name "
        ") as subquery "
        "WHERE tn.taxon_name_id=subquery.taxon_name_id;"
    )
    op.drop_column("taxon_name", "informal")


def downgrade():
    op.add_column(
        "taxon_name",
        sa.Column(
            "informal",
            sa.VARCHAR(length=2),
            autoincrement=False,
            nullable=True,
            comment=(
                "Flag indicating whether name is used informally but not yet formally"
                " published"
            ),
        ),
    )
    op.execute(
        "UPDATE taxon_name tn SET informal=subquery.publication_status FROM ("
        "SELECT ("
        "CASE "
        "WHEN publication_status = 'manuscript_name' THEN 'MS' "
        "WHEN publication_status = 'phrase_name' THEN 'PN' "
        "WHEN publication_status = 'published' THEN null "
        "END) as publication_status, "
        "taxon_name_id "
        "FROM taxon_name "
        ") as subquery "
        "WHERE tn.taxon_name_id=subquery.taxon_name_id"
    )
    op.drop_column("taxon_name", "publication_status")
