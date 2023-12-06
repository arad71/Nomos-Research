"""Recreate hierarchy path indexes

Revision ID: 199d62d63d05
Revises: 89283b31cc02
Create Date: 2022-08-23 15:53:24.192158+08:00

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "199d62d63d05"
down_revision = "89283b31cc02"
branch_labels = None
depends_on = None


def upgrade():
    recreated_indexes()


def recreated_indexes():
    op.drop_index("ix_nodes_path", table_name="hierarchy", postgresql_using="gist")
    op.create_index(
        "ix_nodes_path", "hierarchy", ["path"], unique=False, postgresql_using="gist"
    )


def downgrade():
    recreated_indexes()
