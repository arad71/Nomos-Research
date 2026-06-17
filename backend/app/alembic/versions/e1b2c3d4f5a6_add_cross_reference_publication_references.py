"""Add cross reference publication references

Revision ID: e1b2c3d4f5a6
Revises: d0462642d002
Create Date: 2026-06-09 09:45:00.000000+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "e1b2c3d4f5a6"
down_revision = "d0462642d002"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def constraint_exists(table_name, constraint_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    constraints = inspector.get_check_constraints(table_name)
    constraints += inspector.get_foreign_keys(table_name)
    return constraint_name in [con["name"] for con in constraints]


def index_exists(table_name, index_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return index_name in [idx["name"] for idx in inspector.get_indexes(table_name)]


def upgrade() -> None:
    if column_exists("taxon_publication", "taxon_name_id"):
        op.alter_column("taxon_publication", "taxon_name_id", nullable=True)

    if not column_exists("taxon_publication", "cross_reference_id"):
        op.add_column(
            "taxon_publication",
            sa.Column("cross_reference_id", sa.Integer(), nullable=True),
        )

    if not constraint_exists(
        "taxon_publication", "fk_taxon_publication_cross_reference"
    ):
        op.create_foreign_key(
            "fk_taxon_publication_cross_reference",
            source_table="taxon_publication",
            referent_table="cross_reference",
            local_cols=["cross_reference_id"],
            remote_cols=["cross_reference_id"],
            ondelete="NO ACTION",
        )

    if not constraint_exists(
        "taxon_publication", "chk_taxon_publication_single_parent"
    ):
        op.create_check_constraint(
            "chk_taxon_publication_single_parent",
            "taxon_publication",
            """
            (
                taxon_name_id IS NOT NULL
                AND cross_reference_id IS NULL
            )
            OR (
                taxon_name_id IS NULL
                AND cross_reference_id IS NOT NULL
            )
            """,
        )

    if not index_exists(
        "taxon_publication",
        "ix_taxon_publication_cross_reference_publication_isactive",
    ):
        op.create_index(
            "ix_taxon_publication_cross_reference_publication_isactive",
            "taxon_publication",
            ["cross_reference_id", "publication_id"],
            unique=True,
            postgresql_where=sa.text("deleted = FALSE"),
        )


def downgrade() -> None:
    if constraint_exists("taxon_publication", "chk_taxon_publication_single_parent"):
        op.drop_constraint(
            "chk_taxon_publication_single_parent",
            "taxon_publication",
            type_="check",
        )

    if index_exists(
        "taxon_publication",
        "ix_taxon_publication_cross_reference_publication_isactive",
    ):
        op.drop_index(
            "ix_taxon_publication_cross_reference_publication_isactive",
            table_name="taxon_publication",
        )

    if constraint_exists("taxon_publication", "fk_taxon_publication_cross_reference"):
        op.drop_constraint(
            "fk_taxon_publication_cross_reference",
            "taxon_publication",
            type_="foreignkey",
        )

    if column_exists("taxon_publication", "cross_reference_id"):
        op.drop_column("taxon_publication", "cross_reference_id")

    if column_exists("taxon_publication", "taxon_name_id"):
        op.alter_column("taxon_publication", "taxon_name_id", nullable=False)
