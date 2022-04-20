from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.types import Enum

from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_name import enums
from app.db.taxon_name.constants import (
    AUTHOR,
    COMMENTS,
    CONTRIBUTED_BY,
    CONTRIBUTED_ON,
    EXTERNAL_ID,
    FAMILY_CODE,
    FAMILY_NID,
    FORM_DESC_DY,
    FORM_DESC_MN,
    FORM_DESC_YR,
    IS_CURRENT,
    IS_ERADICATED,
    KINGDOM_ID,
    LINEAR_SEQUENCE,
    NATURALISED_COMMENTS,
    ORIGIN,
    PUBLICATION_ID,
    RANK_ID,
    SOURCE,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
    VALIDATED,
    VERNACULAR,
    VOLUME_INFORMATION,
)


class TaxonName(Base, TableMixin):
    __tablename__ = "taxon_name"
    __table_args__ = (
        UniqueConstraint("legacy_id", name=f"uc_{ __tablename__}_legacy_id"),
        {"comment": TABLE_DESCRIPTION},
    )
    name_plural = "taxon_names"

    taxon_name_id = Column(Integer, primary_key=True, comment=TAXON_NAME_ID)
    kingdom_id = Column(
        Integer,
        ForeignKey("kingdom.kingdom_id"),
        nullable=False,
        comment=KINGDOM_ID,
        doc=KINGDOM_ID,
    )
    kingdom = relationship("Kingdom", backref=name_plural)
    rank_id = Column(
        Integer,
        ForeignKey("taxon_rank.taxon_rank_id"),
        nullable=False,
        comment=RANK_ID,
        doc=RANK_ID,
    )
    taxon_rank = relationship("TaxonRank", backref=name_plural)
    # kingdom = Column(String)
    phylum = Column(String)
    taxon_class = Column(String, name="class", key="class")
    order = Column(String)
    family = Column(String)
    genus = Column(String)
    subgenus = Column(String)
    scientific_name = Column(String)
    species = Column(String)
    subspecies = Column(String)
    # taxon_rank = Column(String(9))
    specific_epithet = Column(String(70))
    infraspecific_epithet = Column(String(70))
    publication_id = Column(
        Integer,
        ForeignKey("publication.publication_id"),
        comment=PUBLICATION_ID,
        doc=PUBLICATION_ID,
    )
    publication = relationship("Publication", backref=name_plural)
    volume_information = Column(
        String(100),
        comment=VOLUME_INFORMATION,
        doc=VOLUME_INFORMATION,
    )
    is_current = Column(
        Boolean,
        nullable=False,
        comment=IS_CURRENT,
        doc=IS_CURRENT,
    )
    origin = Column(
        String(1),
        comment=ORIGIN,
        doc=ORIGIN,
    )
    publication_status = Column(
        Enum(enums.PublicationStatus, name=__tablename__ + "__publication_status")
    )
    form_desc_yr = Column(Integer, comment=FORM_DESC_YR)
    form_desc_mn = Column(Integer, comment=FORM_DESC_MN)
    form_desc_dy = Column(Integer, comment=FORM_DESC_DY)
    comments = Column(String(1000), comment=COMMENTS)
    contributed_by = Column(
        String(16),
        comment=CONTRIBUTED_BY,
        doc=CONTRIBUTED_BY,
    )
    contributed_on = Column(DateTime, comment=CONTRIBUTED_ON)
    validated = Column(
        Boolean,
        nullable=False,
        comment=VALIDATED,
        doc=VALIDATED,
    )
    source = Column(
        String(10),
        comment=SOURCE,
        doc=SOURCE,
    )
    external_id = Column(
        String(10),
        comment=EXTERNAL_ID,
        doc=EXTERNAL_ID,
    )
    family_code = Column(String(5), comment=FAMILY_CODE, doc=FAMILY_CODE)
    author = Column(String(180), comment=AUTHOR, doc=AUTHOR)
    vernacular = Column(
        String(100),
        comment=VERNACULAR,
        doc=VERNACULAR,
    )
    editor = Column(String(60))
    naturalised_status = Column(
        Enum(enums.NaturalisedStatus, name=__tablename__ + "__naturalised_status")
    )
    naturalised_certainty = Column(Boolean)
    is_eradicated = Column(
        String(1),
        comment=IS_ERADICATED,
        doc=IS_ERADICATED,
    )
    naturalised_comments = Column(
        String(400),
        comment=NATURALISED_COMMENTS,
        doc=NATURALISED_COMMENTS,
    )
    linear_sequence = Column(Integer, comment=LINEAR_SEQUENCE, doc=LINEAR_SEQUENCE)
    family_nid = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment=FAMILY_NID,
        doc=FAMILY_NID,
    )
    all_vernaculars = Column(String(200))
    notes = Column(String(3000))
    reference = Column(Text)
    authorised_by = Column(String(16))
    authorised_on = Column(DateTime)
    legacy_id = Column(Integer)
