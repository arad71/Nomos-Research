"""Remove is_active column

Revision ID: 4d87c394a209
Revises: 660df2ea94e9
Create Date: 2022-06-30 10:51:22.607136+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "4d87c394a209"
down_revision = "660df2ea94e9"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("user", "is_active")


def downgrade():
    op.add_column(
        "user",
        sa.Column("is_active", sa.BOOLEAN(), autoincrement=False, nullable=True),
    )
    op.execute('UPDATE "user" set is_active = FALSE where is_active = NULL')
