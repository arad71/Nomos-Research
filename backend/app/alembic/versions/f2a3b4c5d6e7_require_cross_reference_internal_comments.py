"""Require internal comments for cross references without a new name

Revision ID: f2a3b4c5d6e7
Revises: e1b2c3d4f5a6
Create Date: 2026-06-11 00:00:00.000000

"""

from typing import Sequence, Union

from sqlalchemy import inspect

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f2a3b4c5d6e7"
down_revision: Union[str, None] = "e1b2c3d4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def constraint_exists(table_name: str, constraint_name: str) -> bool:
    inspector = inspect(op.get_bind())
    return any(
        constraint["name"] == constraint_name
        for constraint in inspector.get_check_constraints(table_name)
    )


def upgrade() -> None:
    op.execute("""
        UPDATE cross_reference
        SET internal_comments = reference_comments
        WHERE new_name_id IS NULL
          AND (internal_comments IS NULL OR length(trim(internal_comments)) = 0)
          AND reference_comments IS NOT NULL
          AND length(trim(reference_comments)) > 0
    """)

    op.execute("""
        UPDATE cross_reference
        SET internal_comments = 'Migration backfill: no new name supplied'
        WHERE new_name_id IS NULL
          AND (internal_comments IS NULL OR length(trim(internal_comments)) = 0)
    """)

    if constraint_exists("cross_reference", "chk_cross_reference_rationale_required"):
        op.drop_constraint(
            "chk_cross_reference_rationale_required",
            "cross_reference",
            type_="check",
        )

    op.create_check_constraint(
        "chk_cross_reference_rationale_required",
        "cross_reference",
        """
        new_name_id IS NOT NULL
        OR (
            internal_comments IS NOT NULL
            AND length(trim(internal_comments)) > 0
        )
        """,
    )


def downgrade() -> None:
    if constraint_exists("cross_reference", "chk_cross_reference_rationale_required"):
        op.drop_constraint(
            "chk_cross_reference_rationale_required",
            "cross_reference",
            type_="check",
        )

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
