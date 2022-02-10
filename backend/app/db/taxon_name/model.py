from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from app.db.session import Base
from app.db.models import TableMixin


class TaxonName(Base, TableMixin):
    __tablename__ = "taxon_name"

    taxon_name_id = Column(Integer, primary_key=True, index=True)
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
