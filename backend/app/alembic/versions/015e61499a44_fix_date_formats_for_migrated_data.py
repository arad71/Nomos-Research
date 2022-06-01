"""Fix date formats for migrated data

Revision ID: 015e61499a44
Revises: bc9bf95c75c6
Create Date: 2022-05-30 13:56:30.219435+08:00

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "015e61499a44"
down_revision = "bc9bf95c75c6"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "UPDATE citation set updated_on = updated_on + interval '2000 years'  WHERE"
        " updated_on < '2000-01-01'"
    )


def downgrade():
    pass
