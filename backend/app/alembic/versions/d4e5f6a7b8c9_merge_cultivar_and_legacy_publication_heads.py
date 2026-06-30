"""merge cultivar and legacy publication heads

Revision ID: d4e5f6a7b8c9
Revises: a7c8d9e0f1a2, c9e4f8a1b2d3
Create Date: 2026-06-30 10:55:00.000000
"""

from typing import Sequence, Union


revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = (
    "a7c8d9e0f1a2",
    "c9e4f8a1b2d3",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
