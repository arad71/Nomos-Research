TABLE_DESCRIPTION = "Review queue for taxon_name_parents backfill and manual cleanup"
TAXON_NAME_PARENT_REVIEW_ID = "Unique identifier for taxon name parent review"
TAXON_NAME_ID = "Taxon name under review"
STATUS = "Current queue status"
REASON = "Reason this taxon name needs review"
LEGACY_UNINOMIAL = "Legacy uninomial captured when the queue row was generated"
DERIVED_UNINOMIAL = "Derived uninomial captured when the queue row was generated"
CANDIDATE_PARENT_IDS = "Comma-separated candidate parent taxon name ids"
CANDIDATE_PARENT_NAMES = "Pipe-delimited candidate parent names"
PARENT_COUNT = "Current number of parent rows linked to the taxon name"
HYBRID_CATEGORY = "Hybrid category captured when the queue row was generated"
REVIEW_NOTES = "Manual reviewer notes"
REVIEWED_BY = "User who reviewed this queue row"
REVIEWED_ON = "When this queue row was reviewed"
HIERARCHY_CONFIRMED = "Whether the current linked or candidate parent is confirmed by hierarchy data"
HIERARCHY_CONFIRMATION_NOTE = "Summary of hierarchy-based confirmation for the current row"
HAS_HIERARCHY_ROWS = "Whether this taxon name has any active hierarchy rows in Nomos"
INFRAGENERIC_CONFIRMED = (
    "Whether a bracketed infrageneric segment in the scientific name matches a "
    "subgenus signal in Nomos"
)
INFRAGENERIC_CONFIRMATION_NOTE = (
    "Summary of bracketed scientific-name matching against subgenus data"
)
