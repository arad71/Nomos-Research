from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from .session import Base


class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    default_kingdom = Column(Integer)
    default_class = Column(Integer)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)


# See https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/mixins.html
class TableMixin(object):
    @declared_attr
    def updated_by(cls):
        return Column(Integer, ForeignKey('user.user_id'))

    @declared_attr
    def updated_on(cls):
        return Column(DateTime)

    @declared_attr
    def created_by(cls):
        return Column(Integer, ForeignKey('user.user_id'))

    @declared_attr
    def created_on(cls):
        return Column(DateTime)


class Author(Base, TableMixin):
    __tablename__ = "author"

    author_id = Column(Integer, primary_key=True, index=True)
    author = Column(String(30), nullable=False)
    surname = Column(String(30))
    first_names = Column(String(60))
    initials = Column(String(30))
    orc_id = Column(Integer)


class ClassificationSystem(Base, TableMixin):
    __tablename__ = "classification_system"

    classification_system_id = Column(String(10), primary_key=True, index=True)
    class_desc = Column(String(200), nullable=False)
    class_type = Column(String(15), nullable=False)
    preferred = Column(String(1))
    sort_order = Column(Integer)


class InformalGroup(Base, TableMixin):
    __tablename__ = "informal_group"

    informal_group_id = Column(String(10), primary_key=True, index=True)
    class_id = Column(String(10))
    name_id = Column(Integer)


class Kingdom(Base, TableMixin):
    __tablename__ = "kingdom"

    kingdom_id = Column(Integer, primary_key=True, index=True)
    kingdom_name = Column(String(15), nullable=False)
    kingdom_desc = Column(String(200))

class TaxonName(Base, TableMixin):
    __tablename__ = "taxon_name"

    name_id = Column(Integer, primary_key=True, index=True)
    kingdom_id = Column(Integer, nullable=False)
    rank_id = Column(Integer, nullable=False)
    rank_name = Column(String(15), nullable=False)
    uninomial = Column(String)
    kingdom = Column(String)
    phylum = Column(String)
    # class is a reserved word, will this workaround be enough?
    taxon_class = Column(String, name="class", key="class")
    order = Column(String)
    family = Column(String)
    genus = Column(String)
    subgenus = Column(String)
    scientific_name = Column(String)
    species = Column(String)
    subspecies = Column(String)
    taxon_rank = Column(String(9))
    specific_epithet = Column(String(70))
    infraspecific_epithet = Column(String(70))
    publication_id = Column(Integer)
    volume_information = Column(String(100))
    publication_year = Column(Integer)
    is_current = Column(String(1), nullable=False)
    origin = Column(String(1))
    informal = Column(String(2))
    form_desc_yr = Column(Integer)
    form_desc_mn = Column(Integer)
    form_desc_dy = Column(Integer)
    comments = Column(String(1000))
    contributed_by = Column(String(16))
    contributed_on = Column(DateTime)
    validated = Column(String(1), nullable=False)
    source = Column(String(10))
    external_id = Column(String(10))
    family_code = Column(String(5))
    author = Column(String(180))
    vernacular = Column(String(100))
    editor = Column(String(60))
    naturalised_status = Column(String(1))
    naturalised_certainty = Column(String(1))
    is_eradicated = Column(String(1))
    naturalised_comments = Column(String(400))
    linear_sequence = Column(Integer)
    family_nid = Column(Integer)
    all_vernaculars = Column(String(200))
    notes = Column(String(3000))
    reference = Column(Text(convert_unicode=True))
    authorised_by = Column(String(16))
    authorised_on = Column(DateTime)


class Hierarchy(Base, TableMixin):
    __tablename__ = "hierarchy"

    hierarchy_id = Column(Integer, primary_key=True, index=True)
    name_id = Column(Integer, nullable=False)
    classification_id = Column(String(10), nullable=False)
    parent_nid = Column(Integer, nullable=False)


class Publication(Base, TableMixin):
    __tablename__ = "publication"

    publication_id = Column(Integer, primary_key=True, index=True)
    bad_publication = Column(String(1))
    publication = Column(Text(convert_unicode=True))
    publication_name = Column(Text(convert_unicode=True))


class TaxonRank(Base, TableMixin):
    __tablename__ = "taxon_rank"

    kingdom_id = Column(Integer, primary_key=True, index=True)
    rank_id = Column(Integer, nullable=False)
    rank_name = Column(String(15), nullable=False)
    rank_abbrev = Column(String(9))
    direct_parent_rank_id = Column(Integer, nullable=False)
    required_parent_rank_id = Column(Integer, nullable=False)

class Vernacular(Base, TableMixin):
    __tablename__ = "vernacular"

    vernacular = Column(String(120), nullable=False)
    name_id = Column(Integer, primary_key=True, index=True)
    language = Column(String(20), nullable=False)
    lang_pref = Column(String(1))
    preferred = Column(String(1))
    source = Column(String(50))
    enabled = Column(String(1), nullable=False)
    sort_order = Column(Integer)


class CrossReference(Base, TableMixin):
    __tablename__ = "cross_reference"

    xref_id = Column(Integer, primary_key=True, index=True)
    old_name_id = Column(Integer, nullable=False)
    new_name_id = Column(Integer)
    xref_type = Column(String(3), nullable=False)
    active = Column(String(1), nullable=False)
    authorised_by = Column(String(60))
    authorised_yr = Column(Integer)
    authorised_mn = Column(Integer)
    authorised_dy = Column(Integer)
    comments = Column(String(1000))
    notes = Column(String(3000))
