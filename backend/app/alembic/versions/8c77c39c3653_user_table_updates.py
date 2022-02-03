"""Data Model updates.

Revision ID: 8c77c39c3653
Revises: 91979b40eb38
Create Date: 2022-02-02 22:21:37.213448-08:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8c77c39c3653'
down_revision = '91979b40eb38'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('user', 'id', new_column_name='user_id')
    op.add_column('user', sa.Column('default_class', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('default_kingdom', sa.Integer(), nullable=True))
    op.drop_column('user', 'address')


def downgrade():
    op.add_column('user', sa.Column('address', sa.VARCHAR(length=100), autoincrement=False, nullable=True))
    op.drop_index(op.f('ix_user_user_id'), table_name='user')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.alter_column('user', 'user_id', new_column_name='id')
    op.drop_column('user', 'default_kingdom')
    op.drop_column('user', 'default_class')
