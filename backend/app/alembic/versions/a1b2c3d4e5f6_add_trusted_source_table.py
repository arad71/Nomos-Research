"""Add trusted_source table (Phase 1: WACensus provenance support)

Revision ID: a1b2c3d4e5f6
Revises: 9b7269b5da2b
Create Date: 2026-04-28 14:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "9b7269b5da2b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "trusted_source",
        sa.Column("trusted_source_id", sa.Integer(), nullable=False),
        sa.Column(
            "taxon_name_id",
            sa.Integer(),
            nullable=False,
            comment="The TaxonID this trusted source is linked to",
        ),
        sa.Column(
            "trusted_source_name",
            sa.String(length=255),
            nullable=False,
            comment="The name of the trusted source (e.g. 'WACensus', 'AVH', 'APC')",
        ),
        sa.Column(
            "source_identifier",
            sa.String(length=255),
            nullable=True,
            comment=(
                "Optional identifier used by the trusted source for this record "
                "(e.g. external accession number, GUID, taxon code)"
            ),
        ),
        sa.Column(
            "source_url",
            sa.String(length=2048),
            nullable=True,
            comment="Optional URL pointing to the trusted source record",
        ),
        sa.Column(
            "access_date",
            sa.Date(),
            nullable=True,
            comment="Optional date the trusted source record was accessed or verified",
        ),
        sa.Column(
            "notes",
            sa.String(),
            nullable=True,
            comment="Optional free-text notes about the trusted source reference",
        ),
        # TableMixin columns
        sa.Column(
            "deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
            comment="If this record is soft deleted",
        ),
        sa.Column(
            "updated_by",
            sa.Integer(),
            nullable=True,
            comment="The person who updated this record",
        ),
        sa.Column(
            "updated_on",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
            comment="The date this record was updated on",
        ),
        sa.ForeignKeyConstraint(["taxon_name_id"], ["taxon_name.taxon_name_id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["user.user_id"]),
        sa.PrimaryKeyConstraint("trusted_source_id"),
        comment=(
            "Trusted Source records linked to a taxon name. Captures provenance "
            "for taxonomic information (e.g. WACensus decommission continuity). "
            "Phase 1: structured storage only — no vocabulary control or "
            "governance enforcement."
        ),
    )

    op.create_index(
        "ix_trusted_source_taxon_name_id",
        "trusted_source",
        ["taxon_name_id"],
        unique=False,
    )
    op.create_index(
        "ix_trusted_source_trusted_source_name",
        "trusted_source",
        ["trusted_source_name"],
        unique=False,
    )
    op.create_index(
        "ix_trusted_source_deleted",
        "trusted_source",
        ["deleted"],
        unique=False,
    )
    op.create_index(
        "ix_trusted_source_updated_by",
        "trusted_source",
        ["updated_by"],
        unique=False,
    )
    op.create_index(
        "ix_trusted_source_updated_on",
        "trusted_source",
        ["updated_on"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_trusted_source_updated_on", table_name="trusted_source")
    op.drop_index("ix_trusted_source_updated_by", table_name="trusted_source")
    op.drop_index("ix_trusted_source_deleted", table_name="trusted_source")
    op.drop_index("ix_trusted_source_trusted_source_name", table_name="trusted_source")
    op.drop_index("ix_trusted_source_taxon_name_id", table_name="trusted_source")
    op.drop_table("trusted_source")
