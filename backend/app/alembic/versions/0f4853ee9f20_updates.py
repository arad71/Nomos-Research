"""Updates.

Revision ID: 0f4853ee9f20
Revises: df49e076f774
Create Date: 2022-02-21 19:36:41.739571-08:00

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0f4853ee9f20"
down_revision = "df49e076f774"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(
        "cross_reference_new_name_id_fkey", "cross_reference", type_="foreignkey"
    )
    op.drop_constraint(
        "cross_reference_old_name_id_fkey", "cross_reference", type_="foreignkey"
    )
    op.create_foreign_key(
        None, "cross_reference", "taxon_name", ["old_name_id"], ["taxon_name_id"]
    )
    op.create_foreign_key(
        None, "cross_reference", "taxon_name", ["new_name_id"], ["taxon_name_id"]
    )
    op.drop_column("taxon_name", "taxon_rank")
    op.drop_column("taxon_name", "kingdom")
    op.create_foreign_key(
        None, "taxon_rank", "taxon_rank", ["direct_parent_rank_id"], ["taxon_rank_id"]
    )
    op.create_index(op.f("ix_user_email"), "user", ["email"], unique=True)
    op.create_index(op.f("ix_user_user_id"), "user", ["user_id"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_user_user_id"), table_name="user")
    op.drop_index(op.f("ix_user_email"), table_name="user")
    op.drop_constraint(None, "taxon_rank", type_="foreignkey")
    op.add_column(
        "taxon_name",
        sa.Column("kingdom", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "taxon_name",
        sa.Column(
            "taxon_rank", sa.VARCHAR(length=9), autoincrement=False, nullable=True
        ),
    )
    op.drop_constraint(None, "cross_reference", type_="foreignkey")
    op.drop_constraint(None, "cross_reference", type_="foreignkey")
    op.create_foreign_key(
        "cross_reference_old_name_id_fkey",
        "cross_reference",
        "cross_reference",
        ["old_name_id"],
        ["cross_reference_id"],
    )
    op.create_foreign_key(
        "cross_reference_new_name_id_fkey",
        "cross_reference",
        "cross_reference",
        ["new_name_id"],
        ["cross_reference_id"],
    )
