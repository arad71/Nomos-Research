"""spell out cross reference type enum

Revision ID: 4b15d68fbe48
Revises: 083e3d01a662
Create Date: 2022-04-27 15:53:09.304470-07:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "4b15d68fbe48"
down_revision = "083e3d01a662"
branch_labels = None
depends_on = None

OLD_ENUM = ("ogv", "exc", "mis", "tsy", "nsy", "con", "forma", "err", "isy")
NEW_ENUM = (
    "orthographic_variant",
    "excluded_name",
    "misapplied_name",
    "subjective_synonym",
    "objective_synonym",
    "concept_change",
    "formal_description",
    "name_entered_in_error",
    "isonym",
)
TYPE_NAME = "cross_reference__cross_reference_type"


def rename_existing_type():
    op.execute(f"ALTER TYPE {TYPE_NAME} RENAME TO {TYPE_NAME}_drop")


def drop_renamed_type():
    op.execute(f"DROP TYPE {TYPE_NAME}_drop")


def apply_combined_enum():
    combined_enum = OLD_ENUM + NEW_ENUM

    rename_existing_type()

    combined_type = sa.Enum(
        *combined_enum, name="cross_reference__cross_reference_type"
    )
    combined_type.create(op.get_bind())
    op.alter_column(
        "cross_reference",
        "cross_reference_type",
        type_=combined_type,
        nullable=False,
        postgresql_using=(
            "cross_reference_type::text::cross_reference__cross_reference_type"
        ),
    )

    drop_renamed_type()


def apply_new_enum():
    rename_existing_type()

    new_type = sa.Enum(*NEW_ENUM, name=f"{TYPE_NAME}")
    new_type.create(op.get_bind())
    op.alter_column(
        "cross_reference",
        "cross_reference_type",
        type_=new_type,
        nullable=False,
        postgresql_using=(
            "cross_reference_type::text::cross_reference__cross_reference_type"
        ),
    )

    drop_renamed_type()


def apply_old_enum():
    rename_existing_type()

    old_type = sa.Enum(*OLD_ENUM, name=f"{TYPE_NAME}")
    old_type.create(op.get_bind())
    op.alter_column(
        "cross_reference",
        "cross_reference_type",
        type_=old_type,
        nullable=False,
        postgresql_using=(
            "cross_reference_type::text::cross_reference__cross_reference_type"
        ),
    )

    drop_renamed_type()


def upgrade():
    apply_combined_enum()

    op.execute(
        "UPDATE cross_reference cr SET cross_reference_type=subquery.crt FROM (SELECT"
        " (CASE"
        " WHEN cross_reference_type = 'ogv' THEN"
        " 'orthographic_variant'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'exc' THEN"
        " 'excluded_name'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'mis' THEN"
        " 'misapplied_name'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'tsy' THEN"
        " 'subjective_synonym'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'nsy' THEN"
        " 'objective_synonym'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'con' THEN"
        " 'concept_change'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'forma' THEN"
        " 'formal_description'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'err' THEN"
        " 'name_entered_in_error'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'isy' THEN"
        " 'isonym'::cross_reference__cross_reference_type"
        " END) as crt, "
        "cross_reference_id "
        "FROM cross_reference "
        ") as subquery "
        "WHERE cr.cross_reference_id=subquery.cross_reference_id;"
    )

    apply_new_enum()


def downgrade():
    apply_combined_enum()

    op.execute(
        "UPDATE cross_reference cr SET cross_reference_type=subquery.crt FROM (SELECT"
        " (CASE"
        " WHEN cross_reference_type = 'orthographic_variant' THEN"
        " 'ogv'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'excluded_name' THEN"
        " 'exc'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'misapplied_name' THEN"
        " 'mis'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'subjective_synonym' THEN"
        " 'tsy'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'objective_synonym' THEN"
        " 'nsy'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'concept_change' THEN"
        " 'con'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'formal_description' THEN"
        " 'forma'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'name_entered_in_error' THEN"
        " 'err'::cross_reference__cross_reference_type"
        " WHEN cross_reference_type = 'isonym' THEN"
        " 'isy'::cross_reference__cross_reference_type"
        " END) as crt, "
        "cross_reference_id "
        "FROM cross_reference "
        ") as subquery "
        "WHERE cr.cross_reference_id=subquery.cross_reference_id;"
    )

    apply_old_enum()
