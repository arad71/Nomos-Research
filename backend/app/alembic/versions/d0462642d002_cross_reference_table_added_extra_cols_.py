"""cross_reference table - added extra cols,constraints

Revision ID: d0462642d002
Revises: 9b7269b5da2b
Create Date: 2026-05-04 11:15:47.818038+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "d0462642d002"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def constraint_exists(table_name, constraint_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return constraint_name in [
        con["name"] for con in inspector.get_check_constraints(table_name)
    ]


def upgrade() -> None:
    if not column_exists("cross_reference", "is_active"):
        op.add_column(
            "cross_reference",
            sa.Column(
                "is_active",
                sa.Boolean(),
                server_default=sa.sql.expression.true(),
                nullable=False,
            ),
        )

    if not column_exists("cross_reference", "publication_id"):
        op.add_column(
            "cross_reference",
            sa.Column("publication_id", sa.Integer(), nullable=True),
        )

        op.create_foreign_key(
            "fk_cross_reference_publication_id",
            source_table="cross_reference",
            referent_table="publication",
            local_cols=["publication_id"],
            remote_cols=["publication_id"],
            ondelete="NO ACTION",
        )

    if not constraint_exists(
        "cross_reference", "chk_cross_reference_new_name_required"
    ):
        # Rule 1: new_name_id nullable only for restricted types
        op.create_check_constraint(
            "chk_cross_reference_new_name_required",
            "cross_reference",
            """
            new_name_id IS NOT NULL
            OR cross_reference_type IN (
                'excluded_name',
                'name_entered_in_error'
            )
            """,
        )
    if not constraint_exists(
        "cross_reference", "chk_cross_reference_rationale_required"
    ):
        op.create_check_constraint(
            "chk_cross_reference_rationale_required",
            "cross_reference",
            """
            new_name_id IS NOT NULL
            OR (
                reference_comments IS NOT NULL
                AND length(trim(reference_comments)) > 0
            )
            """,
        )


def downgrade() -> None:
    if constraint_exists("cross_reference", "fk_cross_reference_publication_id"):
        op.drop_constraint(
            "fk_cross_reference_publication_id",
            "cross_reference",
            type_="foreignkey",
        )
    if constraint_exists("cross_reference", "chk_cross_reference_rationale_required"):
        op.drop_constraint(
            "chk_cross_reference_rationale_required",
            "cross_reference",
            type_="check",
        )
    if column_exists("cross_reference", "publication_id"):
        op.drop_column("cross_reference", "publication_id")
    if column_exists("cross_reference", "is_active"):
        op.drop_column("cross_reference", "is_active")
    if constraint_exists("cross_reference", "chk_cross_reference_new_name_required"):
        op.drop_constraint(
            "chk_cross_reference_new_name_required",
            "cross_reference",
            type_="check",
        )
