"""Set created_by updated_by in user

Revision ID: b322adacae15
Revises: 07b9b3d96e16
Create Date: 2022-07-29 15:14:41.417853+08:00

"""
from os import getenv

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "b322adacae15"
down_revision = "07b9b3d96e16"
branch_labels = None
depends_on = None


def upgrade():
    admin_email = getenv("ADMIN_EMAIL")
    user_id = f"SELECT user_id FROM \"user\" WHERE email = '{admin_email}'"
    op.execute(f'UPDATE "user" SET created_by = ({user_id}) WHERE created_by IS NULL')
    op.execute(f'UPDATE "user" SET updated_by = ({user_id}) WHERE updated_by IS NULL')


def downgrade():
    pass
