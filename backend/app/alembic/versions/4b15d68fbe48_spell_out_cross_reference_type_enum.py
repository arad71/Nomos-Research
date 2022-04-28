"""spell out cross reference type enum

Revision ID: 4b15d68fbe48
Revises: 083e3d01a662
Create Date: 2022-04-27 15:53:09.304470-07:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4b15d68fbe48'
down_revision = '083e3d01a662'
branch_labels = None
depends_on = None


def upgrade():

    new_enum = ("orthographic_variant",
                "excluded_name",
                "misapplied_name",
                "subjective_synonym",
                "objective_synonym",
                "concept_change",
                "formal_description",
                "name_entered_in_error")

    new_type = sa.Enum(*new_enum, name="cross_reference__cross_reference_type")

    op.alter_column("cross_reference", "cross_reference_type",
                    new_type=new_type,
                    nullable=False)


def downgrade():
    old_enum = ("ogv",
                "exc",
                "mis",
                "tsy",
                "nsy",
                "con",
                "forma",
                "err",
                "isy")

    old_type = sa.Enum(*old_enum, name="cross_reference__cross_reference_type")

    op.alter_column("cross_reference", "cross_reference_type",
                    new_type=old_type,
                    nullable=False)
