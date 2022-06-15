"""calculate path

Revision ID: 2ad782a75b80
Revises: 13a36cff2b81
Create Date: 2022-06-13 16:31:23.257496+08:00

"""

from app.db.session import get_db
from app.tools.hierarchy_calculation import rebuild_hierarchy_paths

revision = "2ad782a75b80"
down_revision = "13a36cff2b81"
branch_labels = None
depends_on = None


def upgrade():
    rebuild_hierarchy_paths(get_db().__next__())
    pass


def downgrade():
    pass
