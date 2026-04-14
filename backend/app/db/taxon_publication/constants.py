"""
Constants for the taxon_publication table.

These constants are used for column comments, documentation,
and table-level descriptions to ensure consistency across the schema.
"""

# Table description
TABLE_DESCRIPTION = (
    "Link table associating taxon names with publications. "
    "Stores citation-specific context such as page references, "
    "figure references, and notes per taxon-publication relationship. "
    "Does not store publication metadata."
)

# Foreign keys
TAXON_NAME_ID = (
    "Foreign key to taxon_name.taxon_name_id identifying the taxon "
    "to which this publication reference applies."
)

PUBLICATION_ID = (
    "Foreign key to publication.publication_id identifying the linked "
    "publication record. The publication record itself is reusable "
    "across multiple taxa."
)

# Link-level citation context
PAGE_REFERENCE = (
    "Page or page range within the publication relevant to this taxon "
    "(e.g. 'pp. 45–47'). Stored per taxon-publication link."
)

FIGURE_REFERENCE = (
    "Figure, plate, or illustration reference within the publication "
    "relevant to this taxon (e.g. 'Fig. 2'). Stored per taxon-publication link."
)

NOTES = (
    "Free-text notes or commentary describing the relevance of the "
    "publication to this taxon. Stored per taxon-publication link."
)