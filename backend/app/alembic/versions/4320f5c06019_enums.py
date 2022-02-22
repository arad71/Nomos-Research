"""Enums.

Revision ID: 4320f5c06019
Revises: a61b3b720423
Create Date: 2022-02-22 01:34:11.754014-08:00

"""
from enum import Enum

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op
from app.db.citation import enums as citation
from app.db.classification_system import enums as classification_system
from app.db.cross_reference import enums as cross_reference
from app.db.publication import enums as publication
from app.db.taxon_name import enums as taxon_name
from app.db.taxon_rank import enums as taxon_rank
from app.db.vernacular import enums as vernacular

# revision identifiers, used by Alembic.
revision = "4320f5c06019"
down_revision = "a61b3b720423"
branch_labels = None
depends_on = None


def create_enum(table: str, column: str, enum: Enum):
    # wont be required once merged into base migration
    op.drop_column(table, column)
    postgresEnum = postgresql.ENUM(enum, name=table + "_" + column)
    postgresEnum.create(op.get_bind(), checkfirst=True)
    op.add_column(table, sa.Column(column, postgresEnum))


def upgrade():
    cross_reference_cross_reference_type = create_enum('cross_reference', 'cross_reference_type', cross_reference.CrossReferenceType)
    cross_reference_active = create_enum('cross_reference', 'active', cross_reference.Active)
    publication_bad_publication = create_enum('publication', 'bad_publication', publication.BadPublication)
    taxon_name_is_current = create_enum('taxon_name', 'is_current', taxon_name.IsCurrent)
    taxon_name_validated = create_enum('taxon_name', 'validated', taxon_name.Validated)
    taxon_name_naturalised_status = create_enum('taxon_name', 'naturalised_status', taxon_name.NaturalisedStatus)
    taxon_name_naturalised_certainty = create_enum('taxon_name', 'naturalised_certainty', taxon_name.NaturalisedCertainty)
    taxon_rank_rank_abbreviation = create_enum('taxon_rank', 'rank_abbreviation', taxon_rank.RankAbbreviation)
    vernacular_language = create_enum('vernacular', 'language', vernacular.Language)
    vernacular_lang_pref = create_enum('vernacular', 'lang_pref', vernacular.LangPref)
    vernacular_preferred = create_enum('vernacular', 'preferred', vernacular.Preferred)
    vernacular_enabled = create_enum('vernacular', 'enabled', vernacular.Enabled)


def drop_enum(table: str, column: str, enum: Enum):
    op.drop_column(table, column)
    postgresEnum = postgresql.ENUM(enum, name=table + "_" + column)
    postgresEnum.drop(op.get_bind())


def downgrade():
    drop_enum('citation', 'author_type', citation.AuthorType)
    drop_enum('classification_system', 'classification_type', classification_system.ClassificationType)
    drop_enum('classification_system', 'classification_preferred', classification_system.ClassificationPreferred)
    drop_enum('cross_reference', 'cross_reference_type', cross_reference.CrossReferenceType)
    drop_enum('cross_reference', 'active', cross_reference.Active)
    drop_enum('publication', 'bad_publication', publication.BadPublication)
    drop_enum('taxon_name', 'is_current', taxon_name.IsCurrent)
    drop_enum('taxon_name', 'validated', taxon_name.Validated)
    drop_enum('taxon_name', 'naturalised_status', taxon_name.NaturalisedStatus)
    drop_enum('taxon_name', 'naturalised_certainty', taxon_name.NaturalisedCertainty)
    drop_enum('taxon_rank', 'rank_abbreviation', taxon_rank.RankAbbreviation)
    drop_enum('vernacular', 'language', vernacular.Language)
    drop_enum('vernacular', 'lang_pref', vernacular.LangPref)
    drop_enum('vernacular', 'preferred', vernacular.Preferred)
    drop_enum('vernacular', 'enabled', vernacular.Enabled)

