LINEAR_SEQUENCE = "If this is an alien, has it been eradicated?"
FAMILY_NID = "The NameID of the family that is a parent of this taxon"
NATURALISED_COMMENTS = (
    "Is this taxon definitely naturalised."
    "Y = Yes N = there is some doubt whether it is really naturalised."
)
IS_ERADICATED = (
    'Nat Status is a superset of ORIGIN. See domain for values. "A" = old "*"'
)
VERNACULAR = "Derived from HBTVErnaculars to aid performance and querying"
AUTHOR = "Derived field. Denormalised for performance reasons."
FAMILY_CODE = (
    "The family code of this name if it is of rank below family."
    "This field has been retained for backward compatibility and because it is used as "
    "part of Herbarium curatorial procedures."
)
EXTERNAL_ID = "An identifier associated with the external record (if one exists)."
SOURCE = "A code representing an external source this record was derived from. eg. CAVP"
VALIDATED = (
    "Flag indicating whether record is validated or not. "
    "By default all records entered manually are validated, all records entered from "
    "an external source are unvalidated"
)
CONTRIBUTED_ON = "Date this entry was authorised on"
CONTRIBUTED_BY = (
    "Person authorising entry of this name. "
    "This will be the name of a taxonomist who can vouch for the "
    "correctness of the record."
)
AUTHORISED_BY = "Person authorising entry of this name. This will be the name of a taxonomist who can vouch for the correctness of the record."
AUTTHORISED_ON = "Date this entry was authorised on"

COMMENTS = "Comments about name"
FORM_DESC_DY = "Day of date formally described"
FORM_DESC_MN = "Month of date formally described"
FORM_DESC_YR = "Year of date the taxon formally described"
ORIGIN = (
    "Flag indicating whether taxon has been naturalised in Western Australia. "
    "* = naturalised"
)
IS_CURRENT = "Current status, Y = current, N = not current"
VOLUME_INFORMATION = (
    "The volume information of the publication this name was published in"
)
PUBLICATION_ID = "The publication ID of the publication this name was published in"
RANK_ID = "The rank ID of this name"
KINGDOM_ID = "Kingdom this name belongs to. A derived field"
TAXON_NAME_ID = "Unique identifier for name"
TABLE_DESCRIPTION = (
    "All current and non-current taxon names at all levels of the hierarchy"
)
ANIMAL_KINGDOM_NAME = "Animalia"
PLANTAE_KINGDOM_NAME = "Plantae"
FUNGI_KINGDOM_NAME = "Fungi"
AUTONYM = (
    "An autonym is a taxon name where the infraspecific epithet is a repetition "
    "of the specific epithet. The Internation Code of Nomenclature for algae, "
    'fungi, and plants (article 22) states that "The name of any subdivision '
    "of a genus that includes the type of the adopted, legitimate name of the "
    "genus to which it is assigned is to repeat that generic name unaltered as "
    "its epithet, not followed by an author citation (see Art. 46). Such names "
    'are autonyms."'
)
REVIEW = "Mark this taxon name for periodic review."
REVIEW_REASON = "Specify reason for the review of the name."
LEGACY_ID = "Legacy ID"
