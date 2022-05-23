"""timestamp user role

Revision ID: 295b4718da38
Revises: b04ec98feb3d
Create Date: 2022-05-20 15:35:00.372802+08:00

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "295b4718da38"
down_revision = "b04ec98feb3d"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        f'UPDATE "user" SET created_on = current_timestamp WHERE created_on IS NULL'
    )
    op.execute(
        f'UPDATE "user" SET updated_on = current_timestamp WHERE updated_on IS NULL'
    )
    op.execute(
        f'UPDATE "user_role" SET created_on = current_timestamp WHERE created_on IS'
        f" NULL"
    )
    op.execute(
        f'UPDATE "user_role" SET updated_on = current_timestamp WHERE updated_on IS'
        f" NULL"
    )


def downgrade():
    pass
