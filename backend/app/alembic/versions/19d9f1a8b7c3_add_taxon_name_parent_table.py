"""Add taxon name parent table

Revision ID: 19d9f1a8b7c3
Revises: e3b7c4c2a1d9
Create Date: 2026-04-02 16:45:00.000000+08:00

"""

from alembic import op
import sqlalchemy as sa

revision = "19d9f1a8b7c3"
down_revision = "e3b7c4c2a1d9"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "taxon_name_parent",
        sa.Column("taxon_name_parent_id", sa.Integer(), nullable=False),
        sa.Column("taxon_name_id", sa.Integer(), nullable=False),
        sa.Column("parent_taxon_name_id", sa.Integer(), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column(
            "deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.Column("updated_on", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_on", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["parent_taxon_name_id"], ["taxon_name.taxon_name_id"]),
        sa.ForeignKeyConstraint(["taxon_name_id"], ["taxon_name.taxon_name_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("taxon_name_parent_id"),
        sa.CheckConstraint(
            "taxon_name_id <> parent_taxon_name_id",
            name="ck_taxon_name_parent_not_self",
        ),
        comment="This table links a taxon name to one or more parent taxon names",
    )
    op.create_index(
        op.f("ix_taxon_name_parent_created_by"),
        "taxon_name_parent",
        ["created_by"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_created_on"),
        "taxon_name_parent",
        ["created_on"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_deleted"),
        "taxon_name_parent",
        ["deleted"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_updated_by"),
        "taxon_name_parent",
        ["updated_by"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_updated_on"),
        "taxon_name_parent",
        ["updated_on"],
        unique=False,
    )
    op.create_index(
        "ix_taxon_name_parent_taxon_name_id_sequence_isactive",
        "taxon_name_parent",
        ["taxon_name_id", "sequence"],
        unique=True,
        postgresql_where=sa.text("deleted = FALSE"),
    )
    op.create_index(
        "ix_taxon_name_parent_taxon_parent_isactive",
        "taxon_name_parent",
        ["taxon_name_id", "parent_taxon_name_id"],
        unique=True,
        postgresql_where=sa.text("deleted = FALSE"),
    )


def downgrade():
    op.drop_index(
        "ix_taxon_name_parent_taxon_parent_isactive",
        table_name="taxon_name_parent",
        postgresql_where=sa.text("deleted = FALSE"),
    )
    op.drop_index(
        "ix_taxon_name_parent_taxon_name_id_sequence_isactive",
        table_name="taxon_name_parent",
        postgresql_where=sa.text("deleted = FALSE"),
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_updated_on"), table_name="taxon_name_parent"
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_updated_by"), table_name="taxon_name_parent"
    )
    op.drop_index(op.f("ix_taxon_name_parent_deleted"), table_name="taxon_name_parent")
    op.drop_index(
        op.f("ix_taxon_name_parent_created_on"), table_name="taxon_name_parent"
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_created_by"), table_name="taxon_name_parent"
    )
    op.drop_table("taxon_name_parent")
