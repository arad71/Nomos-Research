"""Add Citation Table.

Revision ID: 996fab16cdfa
Revises: f8483ba996fa
Create Date: 2022-02-14 19:35:52.045416-08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "996fab16cdfa"
down_revision = "f8483ba996fa"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "citation",
        sa.Column("citation_id", sa.Integer(), nullable=False),
        sa.Column("taxon_name_id", sa.Integer(), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=True),
        sa.Column("author_type", sa.String(), nullable=True),
        sa.Column("author_order", sa.Integer(), nullable=True),
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.Column("updated_on", sa.DateTime(), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["user.user_id"],
        ),
        sa.ForeignKeyConstraint(
            ["updated_by"],
            ["user.user_id"],
        ),
        sa.PrimaryKeyConstraint("citation_id"),
    )
    op.create_index(
        op.f("ix_citation_citation_id"), "citation", ["citation_id"], unique=False
    )


def downgrade():
    op.drop_index(op.f("ix_citation_citation_id"), table_name="citation")
    op.drop_table("citation")
