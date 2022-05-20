"""timestamp user role

Revision ID: 295b4718da38
Revises: b04ec98feb3d
Create Date: 2022-05-20 15:35:00.372802+08:00

"""
from datetime import datetime

from alembic import op

# revision identifiers, used by Alembic.
revision = "295b4718da38"
down_revision = "b04ec98feb3d"
branch_labels = None
depends_on = None

CURRENT_TIMESTAMP = datetime.now()


def upgrade():
    op.execute(
        f'UPDATE "user" SET created_on = ({CURRENT_TIMESTAMP}) WHERE created_on IS NULL'
    )
    op.execute(
        f'UPDATE "user" SET updated_on = ({CURRENT_TIMESTAMP}) WHERE updated_on IS NULL'
    )
    op.execute(
        f'UPDATE "user_role" SET created_on = ({CURRENT_TIMESTAMP}) WHERE created_on IS'
        " NULL"
    )
    op.execute(
        f'UPDATE "user_role" SET updated_on = ({CURRENT_TIMESTAMP}) WHERE updated_on IS'
        " NULL"
    )


def downgrade():
    pass
