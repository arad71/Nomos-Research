"""Remove publication field

Revision ID: fdbdee613975
Revises: 7fb6d3a47c5e
Create Date: 2022-05-25 16:46:19.352741+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "fdbdee613975"
down_revision = "7fb6d3a47c5e"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE publication SET abbreviated_title = publication")
    op.drop_column("publication", "publication")
    op.create_unique_constraint(
        "uc_publication_abbreviated_title", "publication", ["abbreviated_title"]
    )


def downgrade():
    op.drop_constraint("uc_publication_abbreviated_title", "publication")
    op.add_column(
        "publication", sa.Column("publication", sa.Text(), default="", nullable=True)
    )
    op.execute("UPDATE publication SET publication = abbreviated_title")
    op.alter_column("publication", "publication", nullable=False)
