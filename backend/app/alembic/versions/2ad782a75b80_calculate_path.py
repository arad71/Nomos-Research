"""calculate path

Revision ID: 2ad782a75b80
Revises: 13a36cff2b81
Create Date: 2022-06-13 16:31:23.257496+08:00

"""
from app.db.hierarchy.crud import HierarchyCrud
from app.db.session import get_db

revision = "2ad782a75b80"
down_revision = "13a36cff2b81"
branch_labels = None
depends_on = None


def upgrade():
    HierarchyCrud.rebuild()


def downgrade():
    pass
