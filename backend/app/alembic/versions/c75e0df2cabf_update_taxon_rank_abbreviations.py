"""Update taxon rank abbreviations.

Revision ID: c75e0df2cabf
Revises: 72e7aaa2faa2
Create Date: 2023-06-15 12:46:21.437363+08:00

Add enums [subg, sect, subsect] as valid entries for the taxon_rank.rank_abbrev column.

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "c75e0df2cabf"
down_revision = "72e7aaa2faa2"
branch_labels = None
depends_on = None

# rank abbreviations are not used in all kingdoms.
# the following subquery is used for targeting only applicable taxon_rank entries
subquery = "SELECT kingdom_id FROM kingdom WHERE kingdom_name IN ('Plantae', 'Fungi')"


def upgrade():
    """
    Using raw postgres ALTER TYPE command to modify the value of the existing Enum.
    The sqlAlchemy method op.alter_column was not reliable for modifying the enum value
    during local development.

    Relevant sources:
    https://www.postgresql.org/docs/current/datatype-enum.html
    https://www.postgresql.org/docs/9.1/sql-altertype.html
    """
    # Get current list of enum values
    connection = op.get_bind()
    result = connection.execute(
        "SELECT enumlabel FROM pg_enum "
        "WHERE enumtypid = ( "
        "SELECT oid FROM pg_type "
        "WHERE typname = 'taxon_rank__rank_abbrev' )"
    )
    rows = result.fetchall()
    current_enum_values = [row[0] for row in rows]

    # Add the new enum values if they don't already exist to protect against repeated
    # upgrade actions
    for enum_value in [
        "subg",
        "sect",
        "subsect",
        "ser",
        "subser",
        "supersp",
        "subforma",
    ]:
        if enum_value not in current_enum_values:
            op.execute(f"ALTER TYPE taxon_rank__rank_abbrev ADD VALUE '{enum_value}'")
            op.execute("COMMIT")

    # All enum types are defined, update or populate the values for new enums
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'subg' WHERE rank_name = 'Subgenus' AND"
        f" kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'sect' WHERE rank_name = 'Section' AND"
        f" kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'subsect' WHERE rank_name = 'Subsection'"
        f" AND kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'ser' WHERE rank_name = 'Series' AND"
        f" kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'subser' WHERE rank_name = 'Subseries'"
        f" AND kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'supersp' WHERE rank_name ="
        f" 'Superspecies' AND kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'subforma' WHERE rank_name = 'Subform'"
        f" AND kingdom_id IN ({subquery})"
    )

    # Ensure all existing abbreviations are correctly set for all ranks in applicable
    # kingdoms as missing enum values will cause name generation to be inaccurate
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'subsp' WHERE rank_name = 'Subspecies'"
        f" AND kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'var' WHERE rank_name = 'Variety' AND"
        f" kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'subvar' WHERE rank_name = 'Subvariety'"
        f" AND kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'forma' WHERE rank_name = 'Form' AND"
        f" kingdom_id IN ({subquery})"
    )


def downgrade():
    """
    Downgrade actions to remove the new enum values have not been added for this
    migration as deleting individual values from an enum type is not supported.

    Official documentation: https://www.postgresql.org/docs/current/datatype-enum.html
    'Although enum types are primarily intended for static sets of values,
    there is support for adding new values to an existing enum type,
    and for renaming values (see ALTER TYPE).
    Existing values cannot be removed from an enum type,
    nor can the sort ordering of such values be changed,
    short of dropping and re-creating the enum type.'

    If a downgrade to remove these enum values is required, those actions should be
    planned and performed by a database administrator.

    Recommended steps:
    1. Confirm existing values in the enum
    2. Change the data type of all columns using the enum to avoid type conflicts
    3. Drop the enum
    4. Recreate the enum with only the required values
    5. Change the data type of all columns previously using the enum

    Relevant sources:
    https://www.postgresql.org/docs/current/sql-altertable.html
    https://www.postgresql.org/docs/current/datatype-enum.html
    https://www.postgresql.org/docs/9.1/sql-altertype.html
    """
    # Remove the rank abbreviations from entries that would not have been populated
    # before this migration had been run.
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Subgenus' AND"
        " kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Section' AND"
        " kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Subsection' AND"
        " kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Series' AND"
        " kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Subseries' AND"
        " kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Superspecies' AND"
        " kingdom_id IN ({subquery})"
    )
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Subform' AND"
        " kingdom_id IN ({subquery})"
    )
