from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    event,
    func,
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import backref, column_property, relationship
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.types import Enum

from app.db.models import BaseModel, TableMixin
from app.db.taxon_name import enums
from app.db.taxon_name.calculated import calculate_fields
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


class TaxonName(BaseModel, TableMixin):
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
    uninomial = Column(String, index=True)
    # kingdom = Column(String)
    phylum = Column(String)
    taxon_class = Column(String, name="class", key="class")
    order = Column(String)
    family = Column(String, index=True)
    genus = Column(String, index=True)
    subgenus = Column(String, index=True)
    canonical_name = Column(String, index=True)
    scientific_name = Column(String, index=True)
    formatted_scientific_name = Column(String)
    species = Column(String, index=True)
    subspecies = Column(String, index=True)
    # taxon_rank = Column(String(9))
    specific_epithet = Column(String(70), index=True)
    infraspecific_epithet = Column(String(70), index=True)
    publication_id = Column(
        Integer,
        ForeignKey("publication.publication_id"),
        comment=PUBLICATION_ID,
        doc=PUBLICATION_ID,
    )
    publication = relationship("Publication", backref=name_plural)
    volume_information = Column(
        String(100), comment=VOLUME_INFORMATION, doc=VOLUME_INFORMATION, index=True
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
    form_desc_yr = Column(Integer, comment=FORM_DESC_YR, index=True)
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
    vernacular = Column(String(100), comment=VERNACULAR, doc=VERNACULAR, index=True)
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
    family_relationship = relationship(
        "TaxonName",
        foreign_keys=[family_nid],
        remote_side=[taxon_name_id],
        backref=backref("in_family", cascade="all, delete-orphan"),
    )
    all_vernaculars = Column(String(200), index=True)
    notes = Column(String(3000))
    reference = Column(Text)
    authorised_by = Column(String(16))
    authorised_on = Column(DateTime)
    legacy_id = Column(String)
    canonical_name_without_rank = column_property(
        func.CONCAT_WS(" ", uninomial, specific_epithet, infraspecific_epithet),
        deferred=True,
    )
    admin_comment = Column(String)

    @hybrid_property
    def classification_system_ids(self):
        return [
            informal_group.classification_system.classification_system_id
            for informal_group in self.informal_groups
        ]


event.listen(TaxonName, "before_insert", calculate_fields)
event.listen(TaxonName, "before_update", calculate_fields)
