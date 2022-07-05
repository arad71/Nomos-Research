"""Spell out naturalised status enum

Revision ID: 638c550d8108
Revises: 36aa968a7287
Create Date: 2022-07-01 15:06:29.948953+08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "638c550d8108"
down_revision = "36aa968a7287"
branch_labels = None
depends_on = None

OLD_ENUM = ("a", "n", "m", "u")
NEW_ENUM = ("alien", "native", "mixed", "uncertain")
TYPE_NAME = "taxon_name__naturalised_status"


def rename_existing_type():
    op.execute(f"ALTER TYPE {TYPE_NAME} RENAME TO {TYPE_NAME}_drop")


def drop_renamed_type():
    op.execute(f"DROP TYPE {TYPE_NAME}_drop")


def apply_combined_enum():
    combined_enum = OLD_ENUM + NEW_ENUM

    rename_existing_type()

    combined_type = sa.Enum(*combined_enum, name="taxon_name__naturalised_status")
    combined_type.create(op.get_bind())
    op.alter_column(
        "taxon_name",
        "naturalised_status",
        type_=combined_type,
        nullable=True,
        postgresql_using="naturalised_status::text::taxon_name__naturalised_status",
    )

    drop_renamed_type()


def apply_new_enum():
    rename_existing_type()

    new_type = sa.Enum(*NEW_ENUM, name=f"{TYPE_NAME}")
    new_type.create(op.get_bind())
    op.alter_column(
        "taxon_name",
        "naturalised_status",
        type_=new_type,
        nullable=True,
        postgresql_using="naturalised_status::text::taxon_name__naturalised_status",
    )

    drop_renamed_type()


def apply_old_enum():
    rename_existing_type()

    old_type = sa.Enum(*OLD_ENUM, name=f"{TYPE_NAME}")
    old_type.create(op.get_bind())
    op.alter_column(
        "taxon_name",
        "naturalised_status",
        type_=old_type,
        nullable=True,
        postgresql_using="naturalised_status::text::taxon_name__naturalised_status",
    )

    drop_renamed_type()


def upgrade():
    apply_combined_enum()

    op.execute(
        "UPDATE taxon_name tn SET naturalised_status=subquery.ns FROM (SELECT"
        " (CASE"
        " WHEN naturalised_status = 'a' THEN"
        " 'alien'::taxon_name__naturalised_status"
        " WHEN naturalised_status = 'n' THEN"
        " 'native'::taxon_name__naturalised_status"
        " WHEN naturalised_status = 'm' THEN"
        " 'mixed'::taxon_name__naturalised_status"
        " WHEN naturalised_status = 'u' THEN"
        " 'uncertain'::taxon_name__naturalised_status"
        " END) as ns, "
        "taxon_name_id "
        "FROM taxon_name "
        ") as subquery "
        "WHERE tn.taxon_name_id=subquery.taxon_name_id;"
    )

    apply_new_enum()


def downgrade():
    apply_combined_enum()

    op.execute(
        "UPDATE taxon_name tn SET naturalised_status=subquery.ns FROM (SELECT"
        " (CASE"
        " WHEN naturalised_status = 'alien' THEN"
        " 'a'::taxon_name__naturalised_status"
        " WHEN naturalised_status = 'native' THEN"
        " 'n'::taxon_name__naturalised_status"
        " WHEN naturalised_status = 'mixed' THEN"
        " 'm'::taxon_name__naturalised_status"
        " WHEN naturalised_status = 'uncertain' THEN"
        " 'u'::taxon_name__naturalised_status"
        " END) as ns, "
        "taxon_name_id "
        "FROM taxon_name "
        ") as subquery "
        "WHERE tn.taxon_name_id=subquery.taxon_name_id;"
    )

    apply_old_enum()
