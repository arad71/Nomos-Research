"""phase 3 leftover migrations

Revision ID: 22e897ac064b
Revises: a1b2c3d4e5f6
Create Date: 2026-05-13 11:19:37.107294+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "22e897ac064b"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def index_exists(table_name, index_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return index_name in [idx["name"] for idx in inspector.get_indexes(table_name)]


def extension_exists(extension_name):
    bind = op.get_bind()
    return bool(
        bind.execute(
            sa.text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_extension
                    WHERE extname = :extension_name
                )
                """
            ),
            {"extension_name": extension_name},
        ).scalar()
    )


def azure_extension_allowed(extension_name):
    bind = op.get_bind()
    allowed_extensions = bind.execute(
        sa.text("SELECT current_setting('azure.extensions', true)")
    ).scalar()

    if allowed_extensions is None:
        return True

    return extension_name in {
        extension.strip().lower()
        for extension in allowed_extensions.split(",")
        if extension.strip()
    }


def ensure_pg_trgm():
    if extension_exists("pg_trgm"):
        return True

    if not azure_extension_allowed("pg_trgm"):
        return False

    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    return extension_exists("pg_trgm")


def upgrade():
    # taxon_name_parent indexes
    if not index_exists("taxon_name_parent", "idx_taxon_name_parent_taxon_id"):
        op.create_index(
            "idx_taxon_name_parent_taxon_id", "taxon_name_parent", ["taxon_name_id"]
        )

    if not index_exists("taxon_name_parent", "idx_taxon_name_parent_sequence"):
        op.create_index(
            "idx_taxon_name_parent_sequence", "taxon_name_parent", ["sequence"]
        )

    # hierarchy partial index
    if not index_exists("hierarchy", "idx_hierarchy_taxon_name_active"):
        op.create_index(
            "idx_hierarchy_taxon_name_active",
            "hierarchy",
            ["taxon_name_id"],
            postgresql_where=sa.text("deleted = false"),
        )

    # GIN + trigram index
    if ensure_pg_trgm() and not index_exists(
        "taxon_name", "idx_taxon_name_scientific_name_trgm"
    ):
        op.create_index(
            "idx_taxon_name_scientific_name_trgm",
            "taxon_name",
            ["scientific_name"],
            postgresql_using="gin",
            postgresql_ops={"scientific_name": "gin_trgm_ops"},
        )

    # taxon_publication indexes
    if not index_exists("taxon_publication", "idx_taxon_publication_taxon_name_id"):
        op.create_index(
            "idx_taxon_publication_taxon_name_id",
            "taxon_publication",
            ["taxon_name_id"],
        )

    if not index_exists("taxon_publication", "idx_taxon_publication_publication_id"):
        op.create_index(
            "idx_taxon_publication_publication_id",
            "taxon_publication",
            ["publication_id"],
        )

    if not index_exists("taxon_publication", "idx_taxon_publication_pubid_taxonpubid"):
        op.create_index(
            "idx_taxon_publication_pubid_taxonpubid",
            "taxon_publication",
            ["publication_id", "taxon_publication_id"],
        )

    # hierarchy index
    if not index_exists("hierarchy", "idx_hierarchy_taxon_name_id"):
        op.create_index("idx_hierarchy_taxon_name_id", "hierarchy", ["taxon_name_id"])

    op.execute(
        "ALTER TYPE public.citation__author_type ADD VALUE IF NOT EXISTS 'ex_current';"
    )
    op.execute(
        "ALTER TYPE public.citation__author_type ADD VALUE IF NOT EXISTS 'ex_basionym';"
    )


def downgrade():
    op.drop_index("idx_hierarchy_taxon_name_id", table_name="hierarchy")

    op.drop_index(
        "idx_taxon_publication_pubid_taxonpubid", table_name="taxon_publication"
    )
    op.drop_index(
        "idx_taxon_publication_publication_id", table_name="taxon_publication"
    )
    op.drop_index("idx_taxon_publication_taxon_name_id", table_name="taxon_publication")

    if index_exists("taxon_name", "idx_taxon_name_scientific_name_trgm"):
        op.drop_index("idx_taxon_name_scientific_name_trgm", table_name="taxon_name")
