TABLE_DESCRIPTION = (
    "Trusted Source records linked to a taxon name. Captures provenance "
    "for taxonomic information (e.g. WACensus decommission continuity). "
    "Phase 1: structured storage only — no vocabulary control or governance "
    "enforcement."
)

TAXON_NAME_ID = "The TaxonID this trusted source is linked to"
TRUSTED_SOURCE_NAME = "The name of the trusted source (e.g. 'WACensus', 'AVH', 'APC')"
SOURCE_IDENTIFIER = (
    "Optional identifier used by the trusted source for this record "
    "(e.g. external accession number, GUID, taxon code)"
)
SOURCE_URL = "Optional URL pointing to the trusted source record"
ACCESS_DATE = "Optional date the trusted source record was accessed or verified"
NOTES = "Optional free-text notes about the trusted source reference"
