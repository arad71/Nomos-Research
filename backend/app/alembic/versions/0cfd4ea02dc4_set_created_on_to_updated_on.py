"""Set created_on to updated_on

Revision ID: 0cfd4ea02dc4
Revises: 7afd7544127e
Create Date: 2022-07-20 09:41:31.805330+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0cfd4ea02dc4"
down_revision = "7afd7544127e"
branch_labels = None
depends_on = None


def upgrade():
    tables = [
        "author",
        "citation",
        "classification_system",
        "cross_reference",
        "hierarchy",
        "informal_group",
        "kingdom",
        "publication",
        "taxon_rank",
    ]
    for table in tables:
        op.execute(
            f"UPDATE { table } SET created_on = updated_on WHERE created_on IS NULL"
            " OR created_on > updated_on"
        )


def downgrade():
    pass
