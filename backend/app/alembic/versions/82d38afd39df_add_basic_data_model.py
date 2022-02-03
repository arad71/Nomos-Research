"""Add basic data model.

Revision ID: 82d38afd39df
Revises: 91979b40eb38
Create Date: 2022-02-02 17:58:13.045838-08:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '82d38afd39df'
down_revision = '91979b40eb38'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('author',
    sa.Column('author', sa.String(length=30), nullable=False),
    sa.Column('surname', sa.String(length=30), nullable=True),
    sa.Column('first_names', sa.String(length=60), nullable=True),
    sa.Column('initials', sa.String(length=30), nullable=True),
    sa.Column('orc_id', sa.Integer(), nullable=False),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('orc_id')
    )
    op.create_index(op.f('ix_author_orc_id'), 'author', ['orc_id'], unique=False)
    op.create_table('classification_system',
    sa.Column('class_id', sa.String(length=10), nullable=False),
    sa.Column('class_desc', sa.String(length=200), nullable=False),
    sa.Column('class_type', sa.String(length=15), nullable=False),
    sa.Column('preferred', sa.String(length=1), nullable=True),
    sa.Column('sort_order', sa.Integer(), nullable=True),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('class_id')
    )
    op.create_index(op.f('ix_classification_system_class_id'), 'classification_system', ['class_id'], unique=False)
    op.create_table('conservation_status',
    sa.Column('name_id', sa.Integer(), nullable=False),
    sa.Column('consv_code', sa.String(length=3), nullable=True),
    sa.Column('list_code', sa.String(length=30), nullable=True),
    sa.Column('epbc', sa.String(length=10), nullable=True),
    sa.Column('wa_iucn', sa.String(length=10), nullable=True),
    sa.Column('iucn_criteria', sa.String(length=150), nullable=True),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('name_id')
    )
    op.create_index(op.f('ix_conservation_status_name_id'), 'conservation_status', ['name_id'], unique=False)
    op.create_table('cross_reference',
    sa.Column('xref_id', sa.Integer(), nullable=False),
    sa.Column('old_name_id', sa.Integer(), nullable=False),
    sa.Column('new_name_id', sa.Integer(), nullable=True),
    sa.Column('xref_type', sa.String(length=3), nullable=False),
    sa.Column('active', sa.String(length=1), nullable=False),
    sa.Column('authorised_by', sa.String(length=60), nullable=True),
    sa.Column('authorised_yr', sa.Integer(), nullable=True),
    sa.Column('authorised_mn', sa.Integer(), nullable=True),
    sa.Column('authorised_dy', sa.Integer(), nullable=True),
    sa.Column('comments', sa.String(length=1000), nullable=True),
    sa.Column('notes', sa.String(length=3000), nullable=True),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('xref_id')
    )
    op.create_index(op.f('ix_cross_reference_xref_id'), 'cross_reference', ['xref_id'], unique=False)
    op.create_table('hierarchy',
    sa.Column('name_id', sa.Integer(), nullable=False),
    sa.Column('classification_id', sa.String(length=10), nullable=False),
    sa.Column('parent_nid', sa.Integer(), nullable=False),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('name_id')
    )
    op.create_index(op.f('ix_hierarchy_name_id'), 'hierarchy', ['name_id'], unique=False)
    op.create_table('informal_group',
    sa.Column('class_id', sa.String(length=10), nullable=False),
    sa.Column('name_id', sa.Integer(), nullable=False),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('class_id', 'name_id')
    )
    op.create_index(op.f('ix_informal_group_class_id'), 'informal_group', ['class_id'], unique=False)
    op.create_index(op.f('ix_informal_group_name_id'), 'informal_group', ['name_id'], unique=False)
    op.create_table('kingdom',
    sa.Column('kingdom_id', sa.Integer(), nullable=False),
    sa.Column('kingdom_name', sa.String(length=15), nullable=False),
    sa.Column('kingdom_desc', sa.String(length=200), nullable=True),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('kingdom_id')
    )
    op.create_index(op.f('ix_kingdom_kingdom_id'), 'kingdom', ['kingdom_id'], unique=False)
    op.create_table('name_id',
    sa.Column('name_id', sa.Integer(), nullable=False),
    sa.Column('external_name_id', sa.String(), nullable=True),
    sa.Column('kingdom_id', sa.Integer(), nullable=False),
    sa.Column('rank_id', sa.Integer(), nullable=False),
    sa.Column('rank_name', sa.String(length=15), nullable=False),
    sa.Column('name1', sa.String(length=40), nullable=False),
    sa.Column('name2', sa.String(length=70), nullable=True),
    sa.Column('rank3', sa.String(length=9), nullable=True),
    sa.Column('name3', sa.String(length=70), nullable=True),
    sa.Column('rank4', sa.String(length=9), nullable=True),
    sa.Column('name4', sa.String(length=70), nullable=True),
    sa.Column('author', sa.String(length=180), nullable=True),
    sa.Column('created_by_app', sa.String(length=40), nullable=True),
    sa.Column('claimed', sa.String(length=1), nullable=False),
    sa.Column('updated_by_app', sa.String(length=40), nullable=True),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('name_id')
    )
    op.create_index(op.f('ix_name_id_name_id'), 'name_id', ['name_id'], unique=False)
    op.create_table('publication',
    sa.Column('publication_id', sa.Integer(), nullable=False),
    sa.Column('bad_publication', sa.String(length=1), nullable=True),
    sa.Column('publication', sa.Text(_expect_unicode=True), nullable=True),
    sa.Column('publication_name', sa.Text(_expect_unicode=True), nullable=True),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('publication_id')
    )
    op.create_index(op.f('ix_publication_publication_id'), 'publication', ['publication_id'], unique=False)
    op.create_table('taxon_name',
    sa.Column('name_id', sa.Integer(), nullable=False),
    sa.Column('kingdom_id', sa.Integer(), nullable=False),
    sa.Column('rank_id', sa.Integer(), nullable=False),
    sa.Column('rank_name', sa.String(length=15), nullable=False),
    sa.Column('uninomial', sa.String(), nullable=True),
    sa.Column('kingdom', sa.String(), nullable=True),
    sa.Column('phylum', sa.String(), nullable=True),
    sa.Column('class', sa.String(), nullable=True),
    sa.Column('order', sa.String(), nullable=True),
    sa.Column('family', sa.String(), nullable=True),
    sa.Column('genus', sa.String(), nullable=True),
    sa.Column('subgenus', sa.String(), nullable=True),
    sa.Column('scientific_name', sa.String(), nullable=True),
    sa.Column('species', sa.String(), nullable=True),
    sa.Column('subspecies', sa.String(), nullable=True),
    sa.Column('taxon_rank', sa.String(length=9), nullable=True),
    sa.Column('specific_epithet', sa.String(length=70), nullable=True),
    sa.Column('infraspecific_epithet', sa.String(length=70), nullable=True),
    sa.Column('publication_id', sa.Integer(), nullable=True),
    sa.Column('volume_information', sa.String(length=100), nullable=True),
    sa.Column('publication_year', sa.Integer(), nullable=True),
    sa.Column('is_current', sa.String(length=1), nullable=False),
    sa.Column('origin', sa.String(length=1), nullable=True),
    sa.Column('informal', sa.String(length=2), nullable=True),
    sa.Column('form_desc_yr', sa.Integer(), nullable=True),
    sa.Column('form_desc_mn', sa.Integer(), nullable=True),
    sa.Column('form_desc_dy', sa.Integer(), nullable=True),
    sa.Column('comments', sa.String(length=1000), nullable=True),
    sa.Column('contributed_by', sa.String(length=16), nullable=True),
    sa.Column('contributed_on', sa.DateTime(), nullable=True),
    sa.Column('validated', sa.String(length=1), nullable=False),
    sa.Column('source', sa.String(length=10), nullable=True),
    sa.Column('external_id', sa.String(length=10), nullable=True),
    sa.Column('family_code', sa.String(length=5), nullable=True),
    sa.Column('author', sa.String(length=180), nullable=True),
    sa.Column('vernacular', sa.String(length=100), nullable=True),
    sa.Column('editor', sa.String(length=60), nullable=True),
    sa.Column('naturalised_status', sa.String(length=1), nullable=True),
    sa.Column('naturalised_certainty', sa.String(length=1), nullable=True),
    sa.Column('is_eradicated', sa.String(length=1), nullable=True),
    sa.Column('naturalised_comments', sa.String(length=400), nullable=True),
    sa.Column('linear_sequence', sa.Integer(), nullable=True),
    sa.Column('family_nid', sa.Integer(), nullable=True),
    sa.Column('all_vernaculars', sa.String(length=200), nullable=True),
    sa.Column('notes', sa.String(length=3000), nullable=True),
    sa.Column('reference', sa.Text(_expect_unicode=True), nullable=True),
    sa.Column('authorised_by', sa.String(length=16), nullable=True),
    sa.Column('authorised_on', sa.DateTime(), nullable=True),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('name_id')
    )
    op.create_index(op.f('ix_taxon_name_name_id'), 'taxon_name', ['name_id'], unique=False)
    op.create_table('taxon_rank',
    sa.Column('kingdom_id', sa.Integer(), nullable=False),
    sa.Column('rank_id', sa.Integer(), nullable=False),
    sa.Column('rank_name', sa.String(length=15), nullable=False),
    sa.Column('rank_abbrev', sa.String(length=9), nullable=True),
    sa.Column('direct_parent_rank_id', sa.Integer(), nullable=False),
    sa.Column('required_parent_rank_id', sa.Integer(), nullable=False),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('kingdom_id')
    )
    op.create_index(op.f('ix_taxon_rank_kingdom_id'), 'taxon_rank', ['kingdom_id'], unique=False)
    op.create_table('vernacular',
    sa.Column('vernacular', sa.String(length=120), nullable=False),
    sa.Column('name_id', sa.Integer(), nullable=False),
    sa.Column('language', sa.String(length=20), nullable=False),
    sa.Column('lang_pref', sa.String(length=1), nullable=True),
    sa.Column('preferred', sa.String(length=1), nullable=True),
    sa.Column('source', sa.String(length=50), nullable=True),
    sa.Column('enabled', sa.String(length=1), nullable=False),
    sa.Column('sort_order', sa.Integer(), nullable=True),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_on', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('name_id')
    )
    op.create_index(op.f('ix_vernacular_name_id'), 'vernacular', ['name_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_vernacular_name_id'), table_name='vernacular')
    op.drop_table('vernacular')
    op.drop_index(op.f('ix_taxon_rank_kingdom_id'), table_name='taxon_rank')
    op.drop_table('taxon_rank')
    op.drop_index(op.f('ix_taxon_name_name_id'), table_name='taxon_name')
    op.drop_table('taxon_name')
    op.drop_index(op.f('ix_publication_publication_id'), table_name='publication')
    op.drop_table('publication')
    op.drop_index(op.f('ix_name_id_name_id'), table_name='name_id')
    op.drop_table('name_id')
    op.drop_index(op.f('ix_kingdom_kingdom_id'), table_name='kingdom')
    op.drop_table('kingdom')
    op.drop_index(op.f('ix_informal_group_name_id'), table_name='informal_group')
    op.drop_index(op.f('ix_informal_group_class_id'), table_name='informal_group')
    op.drop_table('informal_group')
    op.drop_index(op.f('ix_hierarchy_name_id'), table_name='hierarchy')
    op.drop_table('hierarchy')
    op.drop_index(op.f('ix_cross_reference_xref_id'), table_name='cross_reference')
    op.drop_table('cross_reference')
    op.drop_index(op.f('ix_conservation_status_name_id'), table_name='conservation_status')
    op.drop_table('conservation_status')
    op.drop_index(op.f('ix_classification_system_class_id'), table_name='classification_system')
    op.drop_table('classification_system')
    op.drop_index(op.f('ix_author_orc_id'), table_name='author')
    op.drop_table('author')
