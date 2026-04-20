"""add is_wa_recognised to taxon_name

Revision ID: e3b7c4c2a1d9
Revises: 9f0f4f7f7d2b
Create Date: 2026-03-25 11:24:00.000000+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "e3b7c4c2a1d9"
down_revision = "9f0f4f7f7d2b"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def upgrade():
    if not column_exists("taxon_name", "is_wa_recognised"):
        op.add_column(
            "taxon_name",
            sa.Column(
                "is_wa_recognised",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("false"),
            ),
        )


def downgrade():
    if column_exists("taxon_name", "is_wa_recognised"):
        op.drop_column("taxon_name", "is_wa_recognised")
