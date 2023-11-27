import sqlalchemy
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import Index
from sqlalchemy.types import Enum

from app.db.models import BaseModel, TableMixin

from . import calculated, constants, enums


class TaxonName(BaseModel, TableMixin):
    __tablename__ = "taxon_name"
    name_plural = "taxon_names"
    __repr_attrs__ = [
        "taxon_name_id",
        "scientific_name",
        "canonical_name",
        "vernacular",
        "legacy_id",
    ]
    calculate_name: bool = True
    taxon_name_id = sqlalchemy.Column(
        sqlalchemy.Integer, primary_key=True, comment=constants.TAXON_NAME_ID
    )
    kingdom_id = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("kingdom.kingdom_id"),
        nullable=False,
        comment=constants.KINGDOM_ID,
        doc=constants.KINGDOM_ID,
    )
    kingdom = relationship("Kingdom", backref=name_plural)
    rank_id = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("taxon_rank.taxon_rank_id"),
        nullable=False,
        comment=constants.RANK_ID,
        doc=constants.RANK_ID,
    )
    taxon_rank = relationship("TaxonRank", backref=name_plural)
    uninomial = sqlalchemy.Column(sqlalchemy.String, index=True)
    canonical_name = sqlalchemy.Column(sqlalchemy.String, index=True)
    canonical_name_without_rank = sqlalchemy.Column(sqlalchemy.String, index=True)
    scientific_name = sqlalchemy.Column(sqlalchemy.String, index=True)
    formatted_scientific_name = sqlalchemy.Column(sqlalchemy.String)
    specific_epithet = sqlalchemy.Column(sqlalchemy.String(70), index=True)
    infraspecific_epithet = sqlalchemy.Column(sqlalchemy.String(70), index=True)
    publication_id = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("publication.publication_id"),
        comment=constants.PUBLICATION_ID,
        doc=constants.PUBLICATION_ID,
    )
    publication = relationship("Publication", backref=name_plural)
    volume_information = sqlalchemy.Column(
        sqlalchemy.String(100),
        comment=constants.VOLUME_INFORMATION,
        doc=constants.VOLUME_INFORMATION,
        index=True,
    )
    is_current = sqlalchemy.Column(
        sqlalchemy.Boolean,
        nullable=False,
        comment=constants.IS_CURRENT,
        doc=constants.IS_CURRENT,
    )
    origin = sqlalchemy.Column(
        sqlalchemy.String(1),
        comment=constants.ORIGIN,
        doc=constants.ORIGIN,
    )
    publication_status = sqlalchemy.Column(
        Enum(enums.PublicationStatus, name=__tablename__ + "__publication_status")
    )
    form_desc_yr = sqlalchemy.Column(
        sqlalchemy.Integer, comment=constants.FORM_DESC_YR, index=True
    )
    form_desc_mn = sqlalchemy.Column(sqlalchemy.Integer, comment=constants.FORM_DESC_MN)
    form_desc_dy = sqlalchemy.Column(sqlalchemy.Integer, comment=constants.FORM_DESC_DY)
    comments = sqlalchemy.Column(sqlalchemy.String(1000), comment=constants.COMMENTS)
    contributed_by = sqlalchemy.Column(
        sqlalchemy.String(16),
        comment=constants.CONTRIBUTED_BY,
        doc=constants.CONTRIBUTED_BY,
    )
    contributed_on = sqlalchemy.Column(
        sqlalchemy.DateTime, comment=constants.CONTRIBUTED_ON
    )
    validated = sqlalchemy.Column(
        sqlalchemy.Boolean,
        nullable=False,
        comment=constants.VALIDATED,
        doc=constants.VALIDATED,
    )
    source = sqlalchemy.Column(
        sqlalchemy.String(10),
        comment=constants.SOURCE,
        doc=constants.SOURCE,
    )
    external_id = sqlalchemy.Column(
        sqlalchemy.String(10),
        comment=constants.EXTERNAL_ID,
        doc=constants.EXTERNAL_ID,
    )
    family_code = sqlalchemy.Column(
        sqlalchemy.String(5), comment=constants.FAMILY_CODE, doc=constants.FAMILY_CODE
    )
    author = sqlalchemy.Column(
        sqlalchemy.String(180), comment=constants.AUTHOR, doc=constants.AUTHOR
    )
    vernacular = sqlalchemy.Column(
        sqlalchemy.String(100),
        comment=constants.VERNACULAR,
        doc=constants.VERNACULAR,
        index=True,
    )
    editor = sqlalchemy.Column(sqlalchemy.String(60))
    naturalised_status = sqlalchemy.Column(
        Enum(enums.NaturalisedStatus, name=__tablename__ + "__naturalised_status")
    )
    naturalised_certainty = sqlalchemy.Column(sqlalchemy.Boolean)
    is_eradicated = sqlalchemy.Column(
        sqlalchemy.String(1),
        comment=constants.IS_ERADICATED,
        doc=constants.IS_ERADICATED,
    )
    naturalised_comments = sqlalchemy.Column(
        sqlalchemy.String(400),
        comment=constants.NATURALISED_COMMENTS,
        doc=constants.NATURALISED_COMMENTS,
    )
    linear_sequence = sqlalchemy.Column(
        sqlalchemy.Integer,
        comment=constants.LINEAR_SEQUENCE,
        doc=constants.LINEAR_SEQUENCE,
    )
    family_nid = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("taxon_name.taxon_name_id"),
        comment=constants.FAMILY_NID,
        doc=constants.FAMILY_NID,
    )
    family_relationship = relationship(
        "TaxonName",
        foreign_keys=[family_nid],
        remote_side=[taxon_name_id],
        backref=backref("in_family", cascade="all, delete-orphan"),
    )
    all_vernaculars = sqlalchemy.Column(sqlalchemy.String(200), index=True)
    notes = sqlalchemy.Column(sqlalchemy.String(3000))
    reference = sqlalchemy.Column(sqlalchemy.Text)
    authorised_by = sqlalchemy.Column(sqlalchemy.String(16))
    authorised_on = sqlalchemy.Column(sqlalchemy.DateTime)
    legacy_id = sqlalchemy.Column(sqlalchemy.String)

    admin_comment = sqlalchemy.Column(sqlalchemy.String)
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


sqlalchemy.event.listen(TaxonName, "before_insert", calculated.calculate_fields)
sqlalchemy.event.listen(TaxonName, "before_update", calculated.calculate_fields)
