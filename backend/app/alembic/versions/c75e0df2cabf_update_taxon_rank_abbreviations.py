"""Update taxon rank abbreviations.

Revision ID: c75e0df2cabf
Revises: 72e7aaa2faa2
Create Date: 2023-06-15 12:46:21.437363+08:00

Add enums [subg, sect, subsect] as valid entries for the taxon_rank.rank_abbrev column.

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'c75e0df2cabf'
down_revision = '72e7aaa2faa2'
branch_labels = None
depends_on = None


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
    result = connection.execute("SELECT enumlabel FROM pg_enum "
                                "WHERE enumtypid = ( "
                                "SELECT oid FROM pg_type "
                                "WHERE typname = 'taxon_rank__rank_abbrev' )")
    rows = result.fetchall()
    current_enum_values = [row[0] for row in rows]

    # Add the new enum values if they don't already exist to protect against repeated
    # upgrade actions
    for enum_value in ['subg', 'sect', 'subsect']:
        if enum_value not in current_enum_values:
            op.execute(f"ALTER TYPE taxon_rank__rank_abbrev ADD VALUE '{enum_value}'")
            op.execute("COMMIT")

    # All enum types are defined, update or populate the values
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'subg' WHERE rank_name = 'Subgenus'")
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'sect' WHERE rank_name = 'Section'")
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = 'subsect' WHERE rank_name = 'Subsection'")


def downgrade():
    """
    Downgrade actions to remove the three new enum values have not been added for this
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
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Subgenus'")
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Section'")
    op.execute(
        "UPDATE taxon_rank SET rank_abbrev = null WHERE rank_name = 'Subsection'")

