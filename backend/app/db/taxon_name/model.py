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
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import backref, column_property, relationship
from sqlalchemy.schema import Index
from sqlalchemy.types import Enum

from app.db.models import BaseModel, TableMixin

from . import calculated, constants, enums


class TaxonName(BaseModel, TableMixin):
    __tablename__ = "taxon_name"
    name_plural = "taxon_names"
    taxon_name_id = Column(Integer, primary_key=True, comment=constants.TAXON_NAME_ID)
    kingdom_id = Column(
        Integer,
        ForeignKey("kingdom.kingdom_id"),
        nullable=False,
        comment=constants.KINGDOM_ID,
        doc=constants.KINGDOM_ID,
    )
    kingdom = relationship("Kingdom", backref=name_plural)
    rank_id = Column(
        Integer,
        ForeignKey("taxon_rank.taxon_rank_id"),
        nullable=False,
        comment=constants.RANK_ID,
        doc=constants.RANK_ID,
    )
    taxon_rank = relationship("TaxonRank", backref=name_plural)
    uninomial = Column(String, index=True)
    canonical_name = Column(String, index=True)
    scientific_name = Column(String, index=True)
    formatted_scientific_name = Column(String)
    specific_epithet = Column(String(70), index=True)
    infraspecific_epithet = Column(String(70), index=True)
    publication_id = Column(
        Integer,
        ForeignKey("publication.publication_id"),
        comment=constants.PUBLICATION_ID,
        doc=constants.PUBLICATION_ID,
    )
    publication = relationship("Publication", backref=name_plural)
    volume_information = Column(
        String(100),
        comment=constants.VOLUME_INFORMATION,
        doc=constants.VOLUME_INFORMATION,
        index=True,
    )
    is_current = Column(
        Boolean,
        nullable=False,
        comment=constants.IS_CURRENT,
        doc=constants.IS_CURRENT,
    )
    origin = Column(
        String(1),
        comment=constants.ORIGIN,
        doc=constants.ORIGIN,
    )
    publication_status = Column(
        Enum(enums.PublicationStatus, name=__tablename__ + "__publication_status")
    )
    form_desc_yr = Column(Integer, comment=constants.FORM_DESC_YR, index=True)
    form_desc_mn = Column(Integer, comment=constants.FORM_DESC_MN)
    form_desc_dy = Column(Integer, comment=constants.FORM_DESC_DY)
    comments = Column(String(1000), comment=constants.COMMENTS)
    contributed_by = Column(
        String(16),
        comment=constants.CONTRIBUTED_BY,
        doc=constants.CONTRIBUTED_BY,
    )
    contributed_on = Column(DateTime, comment=constants.CONTRIBUTED_ON)
    validated = Column(
        Boolean,
        nullable=False,
        comment=constants.VALIDATED,
        doc=constants.VALIDATED,
    )
    source = Column(
        String(10),
        comment=constants.SOURCE,
        doc=constants.SOURCE,
    )
    external_id = Column(
        String(10),
        comment=constants.EXTERNAL_ID,
        doc=constants.EXTERNAL_ID,
    )
    family_code = Column(
        String(5), comment=constants.FAMILY_CODE, doc=constants.FAMILY_CODE
    )
    author = Column(String(180), comment=constants.AUTHOR, doc=constants.AUTHOR)
    vernacular = Column(
        String(100), comment=constants.VERNACULAR, doc=constants.VERNACULAR, index=True
    )
    editor = Column(String(60))
    naturalised_status = Column(
        Enum(enums.NaturalisedStatus, name=__tablename__ + "__naturalised_status")
    )
    naturalised_certainty = Column(Boolean)
    is_eradicated = Column(
        String(1),
        comment=constants.IS_ERADICATED,
        doc=constants.IS_ERADICATED,
    )
    naturalised_comments = Column(
        String(400),
        comment=constants.NATURALISED_COMMENTS,
        doc=constants.NATURALISED_COMMENTS,
    )
    linear_sequence = Column(
        Integer, comment=constants.LINEAR_SEQUENCE, doc=constants.LINEAR_SEQUENCE
    )
    family_nid = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment=constants.FAMILY_NID,
        doc=constants.FAMILY_NID,
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
    kingdom_name = association_proxy("kingdom", "kingdom_name")
    rank_name = association_proxy("taxon_rank", "rank_name")

    legacy_id_columns = ["legacy_id"]
    __table_args__ = (
        Index(
            f"ix_{__tablename__}_legacy_id_isactive",
            *legacy_id_columns,
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {"comment": constants.TABLE_DESCRIPTION},
    )

    @hybrid_property
    def path(self):
        return [hierarchy.path.path for hierarchy in self.hierarchies]

    @hybrid_property
    def classification_system_ids(self):
        return [
            informal_group.classification_system.classification_system_id
            for informal_group in self.informal_groups
        ]


event.listen(TaxonName, "before_insert", calculated.calculate_fields)
event.listen(TaxonName, "before_update", calculated.calculate_fields)
