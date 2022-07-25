"""Add deleted column

Revision ID: 6d398e139c74
Revises: 36aa968a7287
Create Date: 2022-06-27 17:13:44.980697+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "6d398e139c74"
down_revision = "0a628b43fda0"
branch_labels = None
depends_on = None


def upgrade():
    for table in ("author", "citation","classification_system", "cross_reference",
                  "hierarchy", "informal_group", "kingdom", "publication",
                  "taxon_name", "taxon_rank", "user", "user_role", "vernacular"):
        op.add_column(
            table,
            sa.Column(
                "deleted",
                sa.Boolean(),
                nullable=True,
                comment="If this record is soft deleted",
            ),
        )
        op.execute(f'UPDATE "{table}" SET deleted = FALSE WHERE deleted IS NULL')
        op.alter_column(table, "deleted", nullable=False)

    op.drop_constraint(
        "uc_publication_abbreviated_title", "publication", type_="unique"
    )
    op.create_index(
        op.f("ix_taxon_name_uninomial"), "taxon_name", ["uninomial"], unique=False
    )


def downgrade():
    op.drop_column("vernacular", "deleted")
    op.drop_column("user_role", "deleted")
    op.drop_column("user", "deleted")
    op.drop_column("taxon_rank", "deleted")
    op.drop_index(op.f("ix_taxon_name_uninomial"), table_name="taxon_name")
    op.drop_column("taxon_name", "deleted")
    op.create_unique_constraint(
        "uc_publication_abbreviated_title", "publication", ["abbreviated_title"]
    )
    op.drop_column("publication", "deleted")
    op.drop_column("kingdom", "deleted")
    op.drop_column("informal_group", "deleted")
    op.drop_column("hierarchy", "deleted")
    op.drop_column("cross_reference", "deleted")
    op.drop_column("classification_system", "deleted")
    op.drop_column("citation", "deleted")
    op.drop_column("author", "deleted")
