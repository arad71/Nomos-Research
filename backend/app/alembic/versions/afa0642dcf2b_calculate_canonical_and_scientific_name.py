"""Calculate Canonical and Scientific Name

Revision ID: afa0642dcf2b
Revises: 958dbfd23694
Create Date: 2023-11-28 13:13:40.263905+08:00

"""

from sqlalchemy.orm import sessionmaker

import app.db.taxon_name.crud as crud
from alembic import op

# revision identifiers, used by Alembic.
revision = "afa0642dcf2b"
down_revision = "958dbfd23694"
branch_labels = None
depends_on = None


def upgrade():
    session = sessionmaker(bind=op.get_bind())
    with session() as db:
        crud.TaxonNameCrud.calculate_name_formats(
            db=db,
            use_fallback=True,
        )
        db.commit()


def downgrade():
    pass
