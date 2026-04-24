"""add author deduplication trigger

Revision ID: 9b7269b5da2b
Revises: ebb53e498b77
Create Date: 2026-04-21 11:02:56.873933+08:00

"""

import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

from alembic import op

# revision identifiers, used by Alembic.
revision = "9b7269b5da2b"
down_revision = "ebb53e498b77"
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    bind = op.get_bind()
    inspector = Inspector.from_engine(bind)
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def upgrade():

    if not column_exists("author", "discipline"):
        op.add_column(
            "author",
            sa.Column(
                "discipline",
                sa.String(255),
                nullable=True,
            ),
        )

    if not column_exists("author", "effective_from"):
        op.add_column(
            "author",
            sa.Column(
                "effective_from",
                sa.Date(),
                nullable=True,
            ),
        )
    if not column_exists("author", "effective_to"):
        op.add_column(
            "author",
            sa.Column(
                "effective_to",
                sa.Date(),
                nullable=True,
            ),
        )
    # Trigger function
    op.execute("""
    CREATE OR REPLACE FUNCTION public.enforce_author_identity()
    RETURNS trigger
    LANGUAGE plpgsql
    VOLATILE
    AS $$
    BEGIN
        -- Ignore soft-deleted rows
        IF NEW.deleted THEN
            RETURN NEW;
        END IF;

        -- If abbreviation is unique, allow immediately
        IF NOT EXISTS (
            SELECT 1
            FROM author
            WHERE abbreviation = NEW.abbreviation
              AND deleted = false
              AND author_id <> COALESCE(NEW.author_id, -1)
        ) THEN
            RETURN NEW;
        END IF;

        -- Case 1: abbreviation + surname is unique
        IF NEW.surname IS NOT NULL AND NOT EXISTS (
            SELECT 1
            FROM author
            WHERE abbreviation = NEW.abbreviation
              AND surname = NEW.surname
              AND deleted = false
              AND author_id <> COALESCE(NEW.author_id, -1)
        ) THEN
            RETURN NEW;
        END IF;

        -- Case 2: abbreviation + initials is unique
        IF NEW.initials IS NOT NULL AND NOT EXISTS (
            SELECT 1
            FROM author
            WHERE abbreviation = NEW.abbreviation
              AND initials = NEW.initials
              AND deleted = false
              AND author_id <> COALESCE(NEW.author_id, -1)
        ) THEN
            RETURN NEW;
        END IF;

        -- Case 2: abbreviation + surname +  initials is unique
        IF NEW.surname IS NOT NULL AND NEW.initials IS NOT NULL AND NOT EXISTS (
            SELECT 1
            FROM author
            WHERE abbreviation = NEW.abbreviation
              AND initials = NEW.initials
              AND surname = NEW.surname
              AND deleted = false
              AND author_id <> COALESCE(NEW.author_id, -1)
        ) THEN
            RETURN NEW;
        END IF;
               
        -- Otherwise reject
        RAISE EXCEPTION
            'Author uniqueness violation: abbreviation "%" requires unique surname or initials',
            NEW.abbreviation;
    END;
    $$;
    """)

    # Trigger
    op.execute("""DROP TRIGGER IF EXISTS trg_author_identity ON public.author;   """)

    op.execute("""
    CREATE TRIGGER trg_author_identity
        BEFORE INSERT OR UPDATE
        ON public.author
        FOR EACH ROW
        EXECUTE FUNCTION public.enforce_author_identity();
    """)

    # Drop the index if it exists
    op.execute("""
    DROP INDEX IF EXISTS public.ix_author_abbreviation_isactive;
    """)


def downgrade():

    if column_exists("author", "discipline"):
        op.drop_column("author", "discipline")
    if column_exists("author", "effective_from"):
        op.drop_column("author", "effective_from")
    if column_exists("author", "effective_to"):
        op.drop_column("author", "effective_to")

    # Drop trigger first
    op.execute("""
    DROP TRIGGER IF EXISTS trg_author_identity ON public.author;
    """)

    # Drop function
    op.execute("""
    DROP FUNCTION IF EXISTS public.enforce_author_identity();
    """)

    # Recreate the index if rollback is needed
    op.execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS ix_author_abbreviation_isactive
        ON public.author
        USING btree (abbreviation)
        WHERE deleted = false;
    """)
