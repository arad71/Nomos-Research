"""Add taxon_name formatted_scientific_name.

Revision ID: 062ebd1f35ba
Revises: 4b15d68fbe48
Create Date: 2022-04-28 21:09:00.526974-07:00

"""
import importlib

import sqlalchemy as sa
from sqlalchemy.orm import Session

from alembic import op

dataimport = importlib.import_module("app.import")

# revision identifiers, used by Alembic.
revision = "062ebd1f35ba"
down_revision = "4b15d68fbe48"
branch_labels = None
depends_on = None


def upgrade():
    session = Session(bind=op.get_bind())
    op.add_column(
        "taxon_name", sa.Column("formatted_scientific_name", sa.String(), nullable=True)
    )
    dataimport.trigger_calculated_fields(session)


def downgrade():
    op.drop_column("taxon_name", "formatted_scientific_name")
