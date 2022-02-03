from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from .session import Base


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)


# See https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/mixins.html
class TableMixin(object):
    @declared_attr
    def updated_by(cls):
        return Column(Integer, ForeignKey('user.id'))

    @declared_attr
    def updated_on(cls):
        return Column(DateTime)

    @declared_attr
    def created_by(cls):
        return Column(Integer, ForeignKey('user.id'))

    @declared_attr
    def created_on(cls):
        return Column(DateTime)


class Author(Base, TableMixin):
    __tablename__ = "author"

    author = Column(String(30), nullable=False)
    surname = Column(String(30))
    first_names = Column(String(60))
    initials = Column(String(30))
    orc_id = Column(Integer, primary_key=True, index=True)


class ClassificationSystem(Base, TableMixin):
    __tablename__ = "classification_system"

    class_id = Column(String(10), primary_key=True, index=True)
    class_desc = Column(String(200), nullable=False)
    class_type = Column(String(15), nullable=False)
    preferred = Column(String(1))
    sort_order = Column(Integer)  # 22


class ConservationStatus(Base, TableMixin):
    __tablename__ = "conservation_status"

    name_id = Column(Integer, primary_key=True, index=True)  # 22
    consv_code = Column(String(3))
    list_code = Column(String(30))
    epbc = Column(String(10))
    wa_iucn = Column(String(10))
    iucn_criteria = Column(String(150))


class InformalGroup(Base, TableMixin):
    __tablename__ = "informal_group"

    class_id = Column(String(10), primary_key=True, index=True)
    name_id = Column(Integer, primary_key=True, index=True)  # 22


class Kingdom(Base, TableMixin):
    __tablename__ = "kingdom"

    kingdom_id = Column(Integer, primary_key=True, index=True)  # 22
    kingdom_name = Column(String(15), nullable=False)
    kingdom_desc = Column(String(200))


class NameId(Base, TableMixin):
    __tablename__ = "name_id"

    name_id = Column(Integer, primary_key=True, index=True)  # 22
    external_name_id = Column(String)
    kingdom_id = Column(Integer, nullable=False)  # 22
    rank_id = Column(Integer, nullable=False)  # 22
    rank_name = Column(String(15), nullable=False)
    name1  = Column(String(40), nullable=False)
    name2  = Column(String(70))
    rank3  = Column(String(9))
    name3  = Column(String(70))
    rank4  = Column(String(9))
    name4  = Column(String(70))
    author = Column(String(180))
    created_by_app = Column(String(40))
    claimed = Column(String(1), nullable=False)
    updated_by_app = Column(String(40))


class TaxonName(Base, TableMixin):
    __tablename__ = "taxon_name"

    name_id = Column(Integer, primary_key=True, index=True)  # 22
    kingdom_id = Column(Integer, nullable=False)  # 22
    rank_id = Column(Integer, nullable=False)  # 22
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
    publication_id = Column(Integer)  # 22
    volume_information = Column(String(100))
    publication_year = Column(Integer)  # 22
    is_current = Column(String(1), nullable=False)
    origin = Column(String(1))
    informal = Column(String(2))
    form_desc_yr = Column(Integer)  # 22
    form_desc_mn = Column(Integer)  # 22
    form_desc_dy = Column(Integer)  # 22
    comments = Column(String(1000))
    contributed_by = Column(String(16))
    contributed_on = Column(DateTime) # 7
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
    linear_sequence = Column(Integer)  # 22
    family_nid = Column(Integer)  # 22
    all_vernaculars = Column(String(200))
    notes = Column(String(3000))
    reference = Column(Text(convert_unicode=True))
    authorised_by = Column(String(16))
    authorised_on = Column(DateTime)  # 7


class Hierarchy(Base, TableMixin):
    __tablename__ = "hierarchy"

    name_id = Column(Integer, primary_key=True, index=True)  # 22
    classification_id = Column(String(10), nullable=False)
    parent_nid = Column(Integer, nullable=False)  # 22


class Publication(Base, TableMixin):
    __tablename__ = "publication"

    publication_id = Column(Integer, primary_key=True, index=True)  # 22
    bad_publication = Column(String(1))
    publication = Column(Text(convert_unicode=True))
    publication_name = Column(Text(convert_unicode=True))


class TaxonRank(Base, TableMixin):
    __tablename__ = "taxon_rank"

    kingdom_id = Column(Integer, primary_key=True, index=True)  # 22
    rank_id = Column(Integer, nullable=False)  # 22
    rank_name = Column(String(15), nullable=False)
    rank_abbrev = Column(String(9))
    direct_parent_rank_id = Column(Integer, nullable=False)  # 22
    required_parent_rank_id = Column(Integer, nullable=False)  # 22

class Vernacular(Base, TableMixin):
    __tablename__ = "vernacular"

    vernacular = Column(String(120), nullable=False)
    name_id = Column(Integer, primary_key=True, index=True)  # 22
    language = Column(String(20), nullable=False)
    lang_pref = Column(String(1))
    preferred = Column(String(1))
    source = Column(String(50))
    enabled = Column(String(1), nullable=False)
    sort_order = Column(Integer)  # 22


class CrossReference(Base, TableMixin):
    __tablename__ = "cross_reference"

    xref_id = Column(Integer, primary_key=True, index=True)  # 22
    old_name_id = Column(Integer, nullable=False)  # 22
    new_name_id = Column(Integer)  # 22
    xref_type = Column(String(3), nullable=False)
    active = Column(String(1), nullable=False)
    authorised_by = Column(String(60))
    authorised_yr = Column(Integer)  # 22
    authorised_mn = Column(Integer)  # 22
    authorised_dy = Column(Integer)  # 22
    comments = Column(String(1000))
    notes = Column(String(3000))
