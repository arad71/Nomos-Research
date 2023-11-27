"""Calculate subgenera names

Revision ID: 958dbfd23694
Revises: 43a0dd63fb65
Create Date: 2023-11-15 23:26:33.330225+08:00

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "958dbfd23694"
down_revision = "43a0dd63fb65"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "UPDATE"
        " taxon_name "
        "SET canonical_name_without_rank ="
        " concat_ws(' ', uninomial, specific_epithet, infraspecific_epithet) "
        "WHERE canonical_name_without_rank IS NULL AND NOT taxon_name.deleted"
    )


def downgrade():
    op.execute(
        "UPDATE"
        " taxon_name "
        "SET canonical_name_without_rank = NULL "
        "WHERE NOT taxon_name.deleted"
    )
    pass
