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
    op.add_column(
        "author",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "citation",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "classification_system",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "cross_reference",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "hierarchy",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "informal_group",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "kingdom",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "publication",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.drop_constraint(
        "uc_publication_abbreviated_title", "publication", type_="unique"
    )
    op.add_column(
        "taxon_name",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.create_index(
        op.f("ix_taxon_name_uninomial"), "taxon_name", ["uninomial"], unique=False
    )
    op.add_column(
        "taxon_rank",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "user",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "user_role",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
    )
    op.add_column(
        "vernacular",
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            comment="If this record is soft deleted",
        ),
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
