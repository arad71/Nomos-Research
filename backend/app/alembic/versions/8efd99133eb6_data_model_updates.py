"""Data Model updates.

Revision ID: 8efd99133eb6
Revises: 82d38afd39df
Create Date: 2022-02-02 21:51:29.371355-08:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '8efd99133eb6'
down_revision = '82d38afd39df'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('default_class', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('default_kingdom', sa.Integer(), nullable=True))
    op.alter_column('user', 'id', new_column_name='user_id')
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_index(op.f('ix_user_user_id'), 'user', ['user_id'], unique=False)
    op.drop_column('user', 'address')
    op.drop_index('ix_name_id_name_id', table_name='name_id')
    op.drop_table('name_id')
    op.drop_index('ix_conservation_status_name_id', table_name='conservation_status')
    op.drop_table('conservation_status')
    op.add_column('author', sa.Column('author_id', sa.Integer(), nullable=False))
    op.drop_constraint('author_pkey', 'author', type_='primary')
    op.create_primary_key('author_id', 'author', ['author_id'])
    op.create_index(op.f('ix_author_author_id'), 'author', ['author_id'], unique=False)
    op.drop_index('ix_author_orc_id', table_name='author')
    op.drop_constraint('author_created_by_fkey', 'author', type_='foreignkey')
    op.drop_constraint('author_updated_by_fkey', 'author', type_='foreignkey')
    op.create_foreign_key(None, 'author', 'user', ['created_by'], ['user_id'])
    op.create_foreign_key(None, 'author', 'user', ['updated_by'], ['user_id'])
    op.add_column('classification_system', sa.Column('classification_system_id', sa.String(length=10), nullable=False))
    op.create_index(op.f('ix_classification_system_classification_system_id'), 'classification_system', ['classification_system_id'], unique=False)
    op.drop_index('ix_classification_system_class_id', table_name='classification_system')
    op.drop_constraint('classification_system_created_by_fkey', 'classification_system', type_='foreignkey')
    op.drop_constraint('classification_system_updated_by_fkey', 'classification_system', type_='foreignkey')
    op.create_foreign_key(None, 'classification_system', 'user', ['created_by'], ['user_id'])
    op.create_foreign_key(None, 'classification_system', 'user', ['updated_by'], ['user_id'])
    op.drop_column('classification_system', 'class_id')
    op.drop_constraint('cross_reference_updated_by_fkey', 'cross_reference', type_='foreignkey')
    op.drop_constraint('cross_reference_created_by_fkey', 'cross_reference', type_='foreignkey')
    op.create_foreign_key(None, 'cross_reference', 'user', ['updated_by'], ['user_id'])
    op.create_foreign_key(None, 'cross_reference', 'user', ['created_by'], ['user_id'])
    op.add_column('hierarchy', sa.Column('hierarchy_id', sa.Integer(), nullable=False))
    op.create_index(op.f('ix_hierarchy_hierarchy_id'), 'hierarchy', ['hierarchy_id'], unique=False)
    op.drop_index('ix_hierarchy_name_id', table_name='hierarchy')
    op.drop_constraint('hierarchy_created_by_fkey', 'hierarchy', type_='foreignkey')
    op.drop_constraint('hierarchy_updated_by_fkey', 'hierarchy', type_='foreignkey')
    op.create_foreign_key(None, 'hierarchy', 'user', ['updated_by'], ['user_id'])
    op.create_foreign_key(None, 'hierarchy', 'user', ['created_by'], ['user_id'])
    op.add_column('informal_group', sa.Column('informal_group_id', sa.String(length=10), nullable=False))
    op.drop_constraint('informal_group_pkey', 'informal_group', type_='primary')
    op.create_primary_key('informal_group_id', 'informal_group', ['informal_group_id'])
    op.alter_column('informal_group', 'class_id',
               existing_type=sa.VARCHAR(length=10),
               nullable=True)
    op.alter_column('informal_group', 'name_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.create_index(op.f('ix_informal_group_informal_group_id'), 'informal_group', ['informal_group_id'], unique=False)
    op.drop_index('ix_informal_group_class_id', table_name='informal_group')
    op.drop_index('ix_informal_group_name_id', table_name='informal_group')
    op.drop_constraint('informal_group_updated_by_fkey', 'informal_group', type_='foreignkey')
    op.drop_constraint('informal_group_created_by_fkey', 'informal_group', type_='foreignkey')
    op.create_foreign_key(None, 'informal_group', 'user', ['updated_by'], ['user_id'])
    op.create_foreign_key(None, 'informal_group', 'user', ['created_by'], ['user_id'])
    op.drop_constraint('kingdom_updated_by_fkey', 'kingdom', type_='foreignkey')
    op.drop_constraint('kingdom_created_by_fkey', 'kingdom', type_='foreignkey')
    op.create_foreign_key(None, 'kingdom', 'user', ['created_by'], ['user_id'])
    op.create_foreign_key(None, 'kingdom', 'user', ['updated_by'], ['user_id'])
    op.drop_constraint('publication_created_by_fkey', 'publication', type_='foreignkey')
    op.drop_constraint('publication_updated_by_fkey', 'publication', type_='foreignkey')
    op.create_foreign_key(None, 'publication', 'user', ['created_by'], ['user_id'])
    op.create_foreign_key(None, 'publication', 'user', ['updated_by'], ['user_id'])
    op.drop_constraint('taxon_name_updated_by_fkey', 'taxon_name', type_='foreignkey')
    op.drop_constraint('taxon_name_created_by_fkey', 'taxon_name', type_='foreignkey')
    op.create_foreign_key(None, 'taxon_name', 'user', ['updated_by'], ['user_id'])
    op.create_foreign_key(None, 'taxon_name', 'user', ['created_by'], ['user_id'])
    op.drop_constraint('taxon_rank_created_by_fkey', 'taxon_rank', type_='foreignkey')
    op.drop_constraint('taxon_rank_updated_by_fkey', 'taxon_rank', type_='foreignkey')
    op.create_foreign_key(None, 'taxon_rank', 'user', ['updated_by'], ['user_id'])
    op.create_foreign_key(None, 'taxon_rank', 'user', ['created_by'], ['user_id'])
    op.drop_constraint('vernacular_updated_by_fkey', 'vernacular', type_='foreignkey')
    op.drop_constraint('vernacular_created_by_fkey', 'vernacular', type_='foreignkey')
    op.create_foreign_key(None, 'vernacular', 'user', ['updated_by'], ['user_id'])
    op.create_foreign_key(None, 'vernacular', 'user', ['created_by'], ['user_id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'vernacular', type_='foreignkey')
    op.drop_constraint(None, 'vernacular', type_='foreignkey')
    op.create_foreign_key('vernacular_created_by_fkey', 'vernacular', 'user', ['created_by'], ['id'])
    op.create_foreign_key('vernacular_updated_by_fkey', 'vernacular', 'user', ['updated_by'], ['id'])
    op.add_column('user', sa.Column('address', sa.VARCHAR(length=100), autoincrement=False, nullable=True))
    op.add_column('user', sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('user_id_seq'::regclass)"), autoincrement=True, nullable=False))
    op.drop_index(op.f('ix_user_user_id'), table_name='user')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_column('user', 'user_id')
    op.drop_column('user', 'default_kingdom')
    op.drop_column('user', 'default_class')
    op.drop_constraint(None, 'taxon_rank', type_='foreignkey')
    op.drop_constraint(None, 'taxon_rank', type_='foreignkey')
    op.create_foreign_key('taxon_rank_updated_by_fkey', 'taxon_rank', 'user', ['updated_by'], ['id'])
    op.create_foreign_key('taxon_rank_created_by_fkey', 'taxon_rank', 'user', ['created_by'], ['id'])
    op.drop_constraint(None, 'taxon_name', type_='foreignkey')
    op.drop_constraint(None, 'taxon_name', type_='foreignkey')
    op.create_foreign_key('taxon_name_created_by_fkey', 'taxon_name', 'user', ['created_by'], ['id'])
    op.create_foreign_key('taxon_name_updated_by_fkey', 'taxon_name', 'user', ['updated_by'], ['id'])
    op.drop_constraint(None, 'publication', type_='foreignkey')
    op.drop_constraint(None, 'publication', type_='foreignkey')
    op.create_foreign_key('publication_updated_by_fkey', 'publication', 'user', ['updated_by'], ['id'])
    op.create_foreign_key('publication_created_by_fkey', 'publication', 'user', ['created_by'], ['id'])
    op.drop_constraint(None, 'kingdom', type_='foreignkey')
    op.drop_constraint(None, 'kingdom', type_='foreignkey')
    op.create_foreign_key('kingdom_created_by_fkey', 'kingdom', 'user', ['created_by'], ['id'])
    op.create_foreign_key('kingdom_updated_by_fkey', 'kingdom', 'user', ['updated_by'], ['id'])
    op.drop_constraint(None, 'informal_group', type_='foreignkey')
    op.drop_constraint(None, 'informal_group', type_='foreignkey')
    op.create_foreign_key('informal_group_created_by_fkey', 'informal_group', 'user', ['created_by'], ['id'])
    op.create_foreign_key('informal_group_updated_by_fkey', 'informal_group', 'user', ['updated_by'], ['id'])
    op.create_index('ix_informal_group_name_id', 'informal_group', ['name_id'], unique=False)
    op.create_index('ix_informal_group_class_id', 'informal_group', ['class_id'], unique=False)
    op.drop_index(op.f('ix_informal_group_informal_group_id'), table_name='informal_group')
    op.alter_column('informal_group', 'name_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('informal_group', 'class_id',
               existing_type=sa.VARCHAR(length=10),
               nullable=False)
    op.drop_column('informal_group', 'informal_group_id')
    op.drop_constraint(None, 'hierarchy', type_='foreignkey')
    op.drop_constraint(None, 'hierarchy', type_='foreignkey')
    op.create_foreign_key('hierarchy_updated_by_fkey', 'hierarchy', 'user', ['updated_by'], ['id'])
    op.create_foreign_key('hierarchy_created_by_fkey', 'hierarchy', 'user', ['created_by'], ['id'])
    op.create_index('ix_hierarchy_name_id', 'hierarchy', ['name_id'], unique=False)
    op.drop_index(op.f('ix_hierarchy_hierarchy_id'), table_name='hierarchy')
    op.drop_column('hierarchy', 'hierarchy_id')
    op.drop_constraint(None, 'cross_reference', type_='foreignkey')
    op.drop_constraint(None, 'cross_reference', type_='foreignkey')
    op.create_foreign_key('cross_reference_created_by_fkey', 'cross_reference', 'user', ['created_by'], ['id'])
    op.create_foreign_key('cross_reference_updated_by_fkey', 'cross_reference', 'user', ['updated_by'], ['id'])
    op.add_column('classification_system', sa.Column('class_id', sa.VARCHAR(length=10), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'classification_system', type_='foreignkey')
    op.drop_constraint(None, 'classification_system', type_='foreignkey')
    op.create_foreign_key('classification_system_updated_by_fkey', 'classification_system', 'user', ['updated_by'], ['id'])
    op.create_foreign_key('classification_system_created_by_fkey', 'classification_system', 'user', ['created_by'], ['id'])
    op.create_index('ix_classification_system_class_id', 'classification_system', ['class_id'], unique=False)
    op.drop_index(op.f('ix_classification_system_classification_system_id'), table_name='classification_system')
    op.drop_column('classification_system', 'classification_system_id')
    op.drop_constraint(None, 'author', type_='foreignkey')
    op.drop_constraint(None, 'author', type_='foreignkey')
    op.create_foreign_key('author_updated_by_fkey', 'author', 'user', ['updated_by'], ['id'])
    op.create_foreign_key('author_created_by_fkey', 'author', 'user', ['created_by'], ['id'])
    op.create_index('ix_author_orc_id', 'author', ['orc_id'], unique=False)
    op.drop_index(op.f('ix_author_author_id'), table_name='author')
    op.alter_column('author', 'orc_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.drop_column('author', 'author_id')
    op.create_table('conservation_status',
    sa.Column('name_id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('consv_code', sa.VARCHAR(length=3), autoincrement=False, nullable=True),
    sa.Column('list_code', sa.VARCHAR(length=30), autoincrement=False, nullable=True),
    sa.Column('epbc', sa.VARCHAR(length=10), autoincrement=False, nullable=True),
    sa.Column('wa_iucn', sa.VARCHAR(length=10), autoincrement=False, nullable=True),
    sa.Column('iucn_criteria', sa.VARCHAR(length=150), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('updated_on', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column('created_by', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('created_on', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], name='conservation_status_created_by_fkey'),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], name='conservation_status_updated_by_fkey'),
    sa.PrimaryKeyConstraint('name_id', name='conservation_status_pkey')
    )
    op.create_index('ix_conservation_status_name_id', 'conservation_status', ['name_id'], unique=False)
    op.create_table('name_id',
    sa.Column('name_id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('external_name_id', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('kingdom_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('rank_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('rank_name', sa.VARCHAR(length=15), autoincrement=False, nullable=False),
    sa.Column('name1', sa.VARCHAR(length=40), autoincrement=False, nullable=False),
    sa.Column('name2', sa.VARCHAR(length=70), autoincrement=False, nullable=True),
    sa.Column('rank3', sa.VARCHAR(length=9), autoincrement=False, nullable=True),
    sa.Column('name3', sa.VARCHAR(length=70), autoincrement=False, nullable=True),
    sa.Column('rank4', sa.VARCHAR(length=9), autoincrement=False, nullable=True),
    sa.Column('name4', sa.VARCHAR(length=70), autoincrement=False, nullable=True),
    sa.Column('author', sa.VARCHAR(length=180), autoincrement=False, nullable=True),
    sa.Column('created_by_app', sa.VARCHAR(length=40), autoincrement=False, nullable=True),
    sa.Column('claimed', sa.VARCHAR(length=1), autoincrement=False, nullable=False),
    sa.Column('updated_by_app', sa.VARCHAR(length=40), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('updated_on', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column('created_by', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('created_on', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], name='name_id_created_by_fkey'),
    sa.ForeignKeyConstraint(['updated_by'], ['user.id'], name='name_id_updated_by_fkey'),
    sa.PrimaryKeyConstraint('name_id', name='name_id_pkey')
    )
    op.create_index('ix_name_id_name_id', 'name_id', ['name_id'], unique=False)
    # ### end Alembic commands ###
