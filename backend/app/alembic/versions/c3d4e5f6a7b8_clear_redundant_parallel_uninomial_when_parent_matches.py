"""Clear redundant parallel uninomial when parent-derived value matches

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-04-03 15:35:00.000000
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        WITH parent_values AS (
            SELECT
                child.taxon_name_id,
                STRING_AGG(
                    COALESCE(parent.uninomial, parent.scientific_name, parent.canonical_name),
                    CASE
                        WHEN child.hybrid_category = 'intergrade' THEN ' - '
                        ELSE ' × '
                    END
                    ORDER BY tnp.sequence, tnp.parent_taxon_name_id
                ) AS parent_derived_uninomial
            FROM taxon_name child
            JOIN taxon_name_parent tnp
                ON tnp.taxon_name_id = child.taxon_name_id
               AND tnp.deleted = FALSE
            JOIN taxon_name parent
                ON parent.taxon_name_id = tnp.parent_taxon_name_id
               AND parent.deleted = FALSE
            WHERE child.deleted = FALSE
            GROUP BY child.taxon_name_id, child.hybrid_category
        )
        UPDATE taxon_name target
        SET parallel_override_uninomial = NULL
        FROM parent_values
        WHERE target.taxon_name_id = parent_values.taxon_name_id
          AND target.deleted = FALSE
          AND target.parallel_override_uninomial IS NOT NULL
          AND BTRIM(target.parallel_override_uninomial) = BTRIM(parent_values.parent_derived_uninomial)
          AND BTRIM(COALESCE(target.uninomial, '')) = BTRIM(parent_values.parent_derived_uninomial)
        """)


def downgrade() -> None:
    pass
