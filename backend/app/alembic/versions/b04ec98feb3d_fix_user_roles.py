"""Fix user roles

Revision ID: b04ec98feb3d
Revises: cb5e54b7ad3d
Create Date: 2022-05-17 09:59:24.023518+08:00

"""

# revision identifiers, used by Alembic.

from alembic import op
from app.core.config import settings

revision = "b04ec98feb3d"
down_revision = "cb5e54b7ad3d"
branch_labels = None
depends_on = None


def upgrade():

    admin_email = settings.FIRST_SUPER_ADMIN_EMAIL
    user_select = f"SELECT user_id FROM \"user\" WHERE email = '{admin_email}'"
    op.execute(
        f'UPDATE "user" SET created_by = ({user_select}) WHERE created_by IS NULL'
    )
    op.execute(
        f'UPDATE "user" SET updated_by = ({user_select}) WHERE updated_by IS NULL'
    )
    op.execute(
        f'UPDATE "user_role" SET created_by = ({user_select}) WHERE created_by IS NULL'
    )
    op.execute(
        f'UPDATE "user_role" SET updated_by = ({user_select}) WHERE updated_by IS NULL'
    )


def downgrade():

    pass
