"""Migrate data to deleted column

Revision ID: 660df2ea94e9
Revises: 6d398e139c74
Create Date: 2022-06-30 05:33:13.492712+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "660df2ea94e9"
down_revision = "6d398e139c74"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE cross_reference SET deleted = TRUE WHERE active = FALSE")
    op.execute("UPDATE publication SET deleted = TRUE WHERE bad_publication = TRUE")
    op.execute('UPDATE "user" SET deleted = TRUE WHERE is_active = FALSE')


def downgrade():
    op.execute("UPDATE cross_reference SET active = FALSE WHERE deleted = TRUE")
    op.execute("UPDATE publication SET  bad_publication = TRUE WHERE deleted = TRUE")
    op.execute('UPDATE "user" SET is_active = FALSE WHERE deleted = TRUE')
