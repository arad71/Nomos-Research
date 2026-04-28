"""add legacy columns in taxon table

Revision ID: d82d6d1c0e18
Revises: ebb53e498b77
Create Date: 2026-04-28 09:19:20.855124+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "d82d6d1c0e18"
down_revision = "ebb53e498b77"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def upgrade():
    if not column_exists("taxon_name", "legacy_publication_id"):
        op.add_column(
            "taxon_name",
            sa.Column(
                "legacy_publication_id",
                sa.Integer,
                nullable=True,
            ),
        )


def downgrade():
    if column_exists("taxon_name", "legacy_publication_id"):
        op.drop_column("taxon_name", "legacy_publication_id")
