from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum

from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_name import enums


class TaxonName(Base, TableMixin):
    __tablename__ = "taxon_name"
    __table_args__ = {
        "comment": "All current and non-current taxon names at all levels of the hierarchy"
    }
    name_plural = "taxon_names"

    taxon_name_id = Column(
        Integer, primary_key=True, index=True, comment="Unique identifier for name"
    )
    # Derived from what? is this comment still true?
    kingdom_id = Column(
        Integer,
        ForeignKey("kingdom.kingdom_id"),
        nullable=False,
        comment="Kingdom this name belongs to. A derived field",
    )
    kingdom = relationship("Kingdom", backref=name_plural)
    rank_id = Column(
        Integer,
        ForeignKey("taxon_rank.taxon_rank_id"),
        nullable=False,
        comment="The rank ID of this name",
    )
    taxon_rank = relationship("TaxonRank", backref=name_plural)
    # Are we using/keeping this? is this comment still true?
    rank_name = Column(
        String(15),
        nullable=False,
        comment="A duplicate of the rankname field in HBTRanks. To aid performance.",
    )
    uninomial = Column(String)
    # kingdom = Column(String)
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
    # taxon_rank = Column(String(9))
    specific_epithet = Column(String(70))
    infraspecific_epithet = Column(String(70))
    publication_id = Column(
        Integer,
        ForeignKey("publication.publication_id"),
        comment="The publication ID of the publication this name was published in",
    )
    publication = relationship("Publication", backref=name_plural)
    volume_information = Column(
        String(100),
        comment="The volume information of the publication this name was published in",
    )
    publication_year = Column(Integer, comment="The year of publication")
    # This comment does not match our Enum, should we change the Enum or the comment?
    is_current = Column(
        Enum(enums.IsCurrent, name=__tablename__ + "__is_current"),
        nullable=False,
        comment="Current status, Y = current, N = not current",
    )
    origin = Column(
        String(1),
        comment="Flag indicating whether taxon has been naturalised in Western Australia. * = naturalised",
    )
    informal = Column(
        String(2),
        comment="Flag indicating whether name is used informally but not yet formally published",
    )
    # Elsewhere we have moved YR/MN/DY into a single date field. Do we want to here?
    form_desc_yr = Column(Integer, comment="Year of date the taxon formally described")
    form_desc_mn = Column(Integer, comment="Month of date formally described")
    form_desc_dy = Column(Integer, comment="Day of date formally described")
    comments = Column(String(1000), comment="Comments about name")
    contributed_by = Column(
        String(16),
        comment="Person authorising entry of this name. This will be the name of a taxonomist who can vouch for the correctness of the record.",
    )
    contributed_on = Column(DateTime, comment="Date this entry was authorised on")
    validated = Column(
        Enum(enums.Validated, name=__tablename__ + "__validated"),
        nullable=False,
        comment="Flag indicating whether record is validated or not. By default all records entered manually are validated, all records entered from an external source are unvalidated.",
    )
    source = Column(
        String(10),
        comment="A code representing an external source this record was derived from. eg. CAVP",
    )
    external_id = Column(
        String(10),
        comment="An identifier associated with the external record (if one exists).",
    )
    family_code = Column(
        String(5),
        comment="The family code of this name if it is of rank below family. This field has been retained for backward compatibility and because it is used as part of Herbarium curatorial procedures.",
    )
    # Is this still true/needed?
    author = Column(
        String(180), comment="Derived field. Denormalised for performance reasons."
    )
    # Is this still true/needed?
    vernacular = Column(
        String(100),
        comment="Derived from HBTVErnaculars to aid performance and querying",
    )
    editor = Column(String(60))
    naturalised_status = Column(
        Enum(enums.NaturalisedStatus, name=__tablename__ + "__naturalised_status")
    )
    naturalised_certainty = Column(
        Enum(enums.NaturalisedCertainty, name=__tablename__ + "__naturalised_certainty")
    )
    # Comment doesn't seem to match column
    is_eradicated = Column(
        String(1),
        comment='Nat Status is a superset of ORIGIN. See domain for values. "A" = old "*"',
    )
    # Comment doesn't seem to match column
    naturalised_comments = Column(
        String(400),
        comment="Is this taxon definitely naturalised. Y = Yes N = there is some doubt whether it is really naturalised.",
    )
    # Comment doesn't seem to match column
    linear_sequence = Column(
        Integer, comment="If this is an alien, has it been eradicated?"
    )
    family_nid = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment="The NameID of the family that is a parent of this taxon",
    )
    all_vernaculars = Column(String(200))
    notes = Column(String(3000))
    reference = Column(Text)
    authorised_by = Column(String(16))
    authorised_on = Column(DateTime)
