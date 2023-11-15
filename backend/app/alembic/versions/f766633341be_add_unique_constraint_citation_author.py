"""Add unique constraint citation author

Revision ID: f766633341be
Revises: db7b500d8496
Create Date: 2022-06-16 13:25:27.385079+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "f766633341be"
down_revision = "db7b500d8496"
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint(
        "uc_citation_author_id",
        "citation",
        ["author_id", "taxon_name_id", "author_type"],
    )


def downgrade():
    op.drop_constraint("uc_citation_author_id", "citation", type_="unique")
