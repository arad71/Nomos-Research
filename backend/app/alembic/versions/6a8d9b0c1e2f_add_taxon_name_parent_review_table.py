"""Add taxon name parent review table

Revision ID: 6a8d9b0c1e2f
Revises: 4f3c2d1b8a77
Create Date: 2026-04-02 23:05:00.000000+08:00

"""

import sqlalchemy as sa

from alembic import op

revision = "6a8d9b0c1e2f"
down_revision = "4f3c2d1b8a77"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "taxon_name_parent_review",
        sa.Column("taxon_name_parent_review_id", sa.Integer(), nullable=False),
        sa.Column("taxon_name_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.Column("reason", sa.String(length=128), nullable=True),
        sa.Column("legacy_uninomial", sa.String(), nullable=True),
        sa.Column("derived_uninomial", sa.String(), nullable=True),
        sa.Column("candidate_parent_ids", sa.Text(), nullable=True),
        sa.Column("candidate_parent_names", sa.Text(), nullable=True),
        sa.Column("parent_count", sa.Integer(), nullable=True),
        sa.Column("hybrid_category", sa.String(length=64), nullable=True),
        sa.Column("review_notes", sa.String(length=1000), nullable=True),
        sa.Column("reviewed_by", sa.Integer(), nullable=True),
        sa.Column("reviewed_on", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column(
            "deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.Column("updated_on", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_on", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["created_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["user.user_id"]),
        sa.ForeignKeyConstraint(["taxon_name_id"], ["taxon_name.taxon_name_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("taxon_name_parent_review_id"),
        comment="This table stores review queue rows for taxon name parent backfill outcomes",
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_created_by"),
        "taxon_name_parent_review",
        ["created_by"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_created_on"),
        "taxon_name_parent_review",
        ["created_on"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_deleted"),
        "taxon_name_parent_review",
        ["deleted"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_reason"),
        "taxon_name_parent_review",
        ["reason"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_reviewed_by"),
        "taxon_name_parent_review",
        ["reviewed_by"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_reviewed_on"),
        "taxon_name_parent_review",
        ["reviewed_on"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_status"),
        "taxon_name_parent_review",
        ["status"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_updated_by"),
        "taxon_name_parent_review",
        ["updated_by"],
        unique=False,
    )
    op.create_index(
        op.f("ix_taxon_name_parent_review_updated_on"),
        "taxon_name_parent_review",
        ["updated_on"],
        unique=False,
    )
    op.create_index(
        "ix_taxon_name_parent_review_taxon_name_id_isactive",
        "taxon_name_parent_review",
        ["taxon_name_id"],
        unique=True,
        postgresql_where=sa.text("deleted = FALSE"),
    )


def downgrade():
    op.drop_index(
        "ix_taxon_name_parent_review_taxon_name_id_isactive",
        table_name="taxon_name_parent_review",
        postgresql_where=sa.text("deleted = FALSE"),
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_updated_on"),
        table_name="taxon_name_parent_review",
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_updated_by"),
        table_name="taxon_name_parent_review",
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_status"),
        table_name="taxon_name_parent_review",
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_reviewed_on"),
        table_name="taxon_name_parent_review",
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_reviewed_by"),
        table_name="taxon_name_parent_review",
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_reason"),
        table_name="taxon_name_parent_review",
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_deleted"),
        table_name="taxon_name_parent_review",
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_created_on"),
        table_name="taxon_name_parent_review",
    )
    op.drop_index(
        op.f("ix_taxon_name_parent_review_created_by"),
        table_name="taxon_name_parent_review",
    )
    op.drop_table("taxon_name_parent_review")
