"""Rename vernacular to vernacular_name.

Revision ID: 89283b31cc02
Revises: 195c6b487b43
Create Date: 2022-08-18 15:56:57.647646+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "89283b31cc02"
down_revision = "195c6b487b43"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("vernacular", "vernacular", new_column_name="vernacular_name")
    op.drop_index("ix_vernacular_vernacular", table_name="vernacular")
    op.drop_constraint("uc_vernacular_legacy_id", "vernacular", type_="unique")
    op.create_unique_constraint(
        "uc_vernacular_legacy_id",
        "vernacular",
        ["taxon_name_id", "vernacular_name", "language"],
    )
    op.create_index(
        op.f("ix_vernacular_vernacular_name"),
        "vernacular",
        ["vernacular_name"],
        unique=False,
    )


def downgrade():
    op.alter_column("vernacular", "vernacular_name", new_column_name="vernacular")
    op.drop_index(op.f("ix_vernacular_vernacular_name"), table_name="vernacular")
    op.drop_constraint("uc_vernacular_legacy_id", "vernacular", type_="unique")
    op.create_unique_constraint(
        "uc_vernacular_legacy_id",
        "vernacular",
        ["taxon_name_id", "vernacular", "language"],
    )
    op.create_index(
        "ix_vernacular_vernacular", "vernacular", ["vernacular"], unique=False
    )
