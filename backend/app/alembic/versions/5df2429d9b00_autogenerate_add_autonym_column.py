"""autogenerate Add Autonym Column

Revision ID: 5df2429d9b00
Revises: afa0642dcf2b
Create Date: 2023-11-29 12:52:41.335629+08:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "5df2429d9b00"
down_revision = "afa0642dcf2b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "taxon_name",
        sa.Column(
            "is_autonym",
            sa.Boolean(),
            default=False,
            nullable=False,
            server_default=sa.text("false"),
            comment=(
                "An autonym is a taxon name where the infraspecific epithet is a "
                "repetition of the specific epithet. The Internation Code of "
                "Nomenclature for algae, fungi, and plants (article 22) states "
                'that "The name of any subdivision of a genus that includes the '
                "type of the adopted, legitimate name of the genus to which it is "
                "assigned is to repeat that generic name unaltered as its "
                "epithet, not followed by an author citation (see Art. 46). Such "
                'names are autonyms."'
            ),
        ),
    )
    op.execute(
        "UPDATE taxon_name"
        "   SET is_autonym = TRUE"
        "    WHERE taxon_name_id IN ("
        "        SELECT taxon_name_id"
        "    FROM taxon_name tn"
        "    JOIN taxon_rank tr ON tn.rank_id = tr.taxon_rank_id"
        "    JOIN kingdom k ON tn.kingdom_id = k.kingdom_id"
        "    WHERE specific_epithet = infraspecific_epithet"
        "    AND specific_epithet IS NOT NULL"
        "    AND specific_epithet != ''"
        "    AND NOT tn.deleted"
        "    AND NOT k.deleted"
        "    AND NOT tr.deleted"
        "    AND kingdom_name IN ('Plantae', 'Fungi')"
        ")"
    )


def downgrade():
    op.drop_column("taxon_name", "is_autonym")
