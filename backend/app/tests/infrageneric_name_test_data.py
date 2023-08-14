"""
The data in this file is intended to represent the following test table to test
name generation results from different combinations of defined taxon hierarchies.


Taxonomic Rank Category | Rank        | Uninomial  | Specific Epithet | Infraspecific Epithet | Valid name contributors | Abbreviation | Selection Order | Test: Lowest Only | Test: Highest Only | Test: Mixed | Test: Full | Test: Invalid
------------------------|-------------|------------|------------------|-----------------------|------------------------|--------------|-----------------|-------------------|--------------------|-------------|------------|----------------
Higher order (> Genus)  | N/A         | N/A        | --               | --                    | --                     | --           | --              | --                | --                 | --          | --         | --
Genus                   | Genus       | Genus      | --               | --                    | Genus                  | --           | 1               | valid             | valid              | valid       | valid      | valid
Infragenus              | Subgenus    | Subgenus   | --               | --                    | Subgenus               | subg.        | 6               | --                | valid              | valid       | valid      | --
Infragenus              | Section     | Section    | --               | --                    | Section                | sect.        | 5               | --                | --                 | valid       | valid      | --
Infragenus              | Subsection  | Subsection | --               | --                    | Subsection             | subsect.     | 4               | --                | --                 | valid       | valid      | --
Infragenus              | Series      | Series     | --               | --                    | Series                 | ser.         | 3               | --                | --                 | --          | valid      | --
Infragenus              | Subseries   | Subseries  | --               | --                    | Subseries              | subser.      | 2               | --                | --                 | --          | valid      | --
Infragenus              | Superspecies| Superspecies | --             | --                    | Superspecies           | supersp.     | 1               | valid             | --                 | --          | valid      | valid
Species                 | Species     | Genus2      | species         | --                    | species                | --           | 1               | valid             | valid              | valid       | valid      | valid
Infraspecies            | Subspecies  | Genus3      | species3        | subspecies            | subspecies             | subsp.       | 5               | --                | valid              | valid       | valid      | --
Infraspecies            | Variety     | Genus4      | species4        | variety               | variety                | var.         | 4               | --                | --                 | valid       | valid      | --
Infraspecies            | Subvariety  | Genus5      | species5        | subvariety            | subvariety             | subvar.      | 3               | --                | --                 | valid       | valid      | --
Infraspecies            | Form        | Genus6      | species6        | form                  | form                   | forma        | 2               | --                | --                 | --          | valid      | --
Infraspecies            | Subform     | Genus7      | species7        | subform               | subform                | subforma     | 1               | valid             | --                 | --          | valid      | invalid

"""

"""
All individual taxon entries for the full hierarchy.
These individual elements are used for creating mock sql query results with smaller
hierarchy paths.
"""
from app.db.taxon_name.schema import TaxonNameRow

Division = TaxonNameRow(
    taxon_name_id=26680,
    uninomial="Magnoliophyta",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Division",
    rank_abbrev=None,
)

Class = TaxonNameRow(
    taxon_name_id=26690,
    uninomial="Magnoliopsida",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Class",
    rank_abbrev=None,
)

Order = TaxonNameRow(
    taxon_name_id=26700,
    uninomial="Asterales",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Order",
    rank_abbrev=None,
)

Family = TaxonNameRow(
    taxon_name_id=16441,
    uninomial="Asteraceae",
    specific_epithet=None,
    infraspecific_epithet=None,
    author="Bercht. & J.Presl",
    rank_name="Family",
    rank_abbrev=None,
)

Genus = TaxonNameRow(
    taxon_name_id=13483,
    uninomial="Genus",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Genus",
    rank_abbrev=None,
)

Subgenus = TaxonNameRow(
    taxon_name_id=162756,
    uninomial="Subgenus",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Subgenus",
    rank_abbrev="subg",
)

Section = TaxonNameRow(
    taxon_name_id=162757,
    uninomial="Section",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Section",
    rank_abbrev="sect",
)

Subsection = TaxonNameRow(
    taxon_name_id=162758,
    uninomial="Subsection",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Subsection",
    rank_abbrev="subsect",
)

Series = TaxonNameRow(
    taxon_name_id=162759,
    uninomial="Series",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Series",
    rank_abbrev="ser",
)

Subseries = TaxonNameRow(
    taxon_name_id=162760,
    uninomial="Subseries",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Subseries",
    rank_abbrev="subser",
)

Superspecies = TaxonNameRow(
    taxon_name_id=162761,
    uninomial="Superspecies",
    specific_epithet=None,
    infraspecific_epithet=None,
    author=None,
    rank_name="Superspecies",
    rank_abbrev="supersp",
)

Species = TaxonNameRow(
    taxon_name_id=162762,
    uninomial="Genus2",
    specific_epithet="species",
    infraspecific_epithet=None,
    author=None,
    rank_name="Species",
    rank_abbrev=None,
)

Subspecies = TaxonNameRow(
    taxon_name_id=162763,
    uninomial="Genus3",
    specific_epithet="species3",
    infraspecific_epithet="subspecies",
    author="(S A) F A",
    rank_name="Subspecies",
    rank_abbrev="subsp",
)

Variety = TaxonNameRow(
    taxon_name_id=162764,
    uninomial="Genus4",
    specific_epithet="species4",
    infraspecific_epithet="variety",
    author=None,
    rank_name="Variety",
    rank_abbrev="var",
)

Subvariety = TaxonNameRow(
    taxon_name_id=162765,
    uninomial="Genus5",
    specific_epithet="species5",
    infraspecific_epithet="subvariety",
    author=None,
    rank_name="Subvariety",
    rank_abbrev="subvar",
)

Form = TaxonNameRow(
    taxon_name_id=162766,
    uninomial="Genus6",
    specific_epithet="species6",
    infraspecific_epithet="form",
    author="(F A)",
    rank_name="Form",
    rank_abbrev="forma",
)

Subform = TaxonNameRow(
    taxon_name_id=162767,
    uninomial="Genus7",
    specific_epithet="species7",
    infraspecific_epithet="subform",
    author="(SF A)",
    rank_name="Subform",
    rank_abbrev="subforma",
)

Invalid_subform = TaxonNameRow(
    taxon_name_id=162767,
    uninomial="Genus",
    specific_epithet="subform",
    infraspecific_epithet=None,
    author="(SF A)",
    rank_name="Subform",
    rank_abbrev="subforma",
)
# all valid contributing words in hierarchical order for simplified formatting
# full_hierarchy test results
# Genus
# subg. Subgenus
# sect. Section
# subsect. Subsection
# ser. Series
# subser. Subseries
# supersp. Superspecies
# species
# subsp. subspecies
# var. variety
# subvar. subvariety
# forma form
# subforma subform


"""
The 'query_set' items in this section are mock representations of results from a single
query to the database. The taxon_id for the lowest ranked taxon in the set is included
in the set name.
"""
query_set_full_hierarchy_162767 = [
    Division,
    Class,
    Order,
    Family,
    Genus,
    Subgenus,
    Section,
    Subsection,
    Series,
    Subseries,
    Superspecies,
    Species,
    Subspecies,
    Variety,
    Subvariety,
    Form,
    Subform,
]
query_set_minimum_lowest_hierarchy_162767 = [Genus, Superspecies, Species, Subform]
query_set_minimum_highest_hierarchy_162763 = [Genus, Subgenus, Species, Subspecies]
query_set_mixed_medium_hierarchy_162765 = [
    Genus,
    Subgenus,
    Section,
    Subsection,
    Species,
    Subspecies,
    Variety,
    Subvariety,
]
query_set_invalid_minimum_lowest_hierarchy_162767 = [
    Genus,
    Superspecies,
    Species,
    Invalid_subform,
]


"""
The 'name_set' items in this section are representation of the expected name outputs for
each defined name format in the project, for each hierarchy scenario defined in the
'query_set' section.
"""

name_set_full_hierarchy_162767 = [
    {"name_version": "Canonical", "formatted_name": "Genus species subforma subform"},
    {
        "name_version": "Canonical without rank",
        "formatted_name": "Genus species subform",
    },
    {
        "name_version": "Infragenus",
        "formatted_name": "Genus (Superspecies) species subforma subform",
    },
    {
        "name_version": "Infragenus with rank",
        "formatted_name": "Genus (supersp. Superspecies) species subforma subform",
    },
    {
        "name_version": "Infragenus without parentheses",
        "formatted_name": "Genus supersp. Superspecies species subforma subform",
    },
    {
        "name_version": "Infragenus without parentheses without rank",
        "formatted_name": "Genus Superspecies species subform",
    },
    {
        "name_version": "Full hierarchy",
        "formatted_name": (
            "Genus subg. Subgenus sect. Section subsect. Subsection ser. Series subser."
            " Subseries supersp. Superspecies species subsp. subspecies var. variety"
            " subvar. subvariety forma form subforma subform"
        ),
    },
]
name_set_minimum_lowest_hierarchy_162767 = [
    {"name_version": "Canonical", "formatted_name": "Genus species subforma subform"},
    {
        "name_version": "Canonical without rank",
        "formatted_name": "Genus species subform",
    },
    {
        "name_version": "Infragenus",
        "formatted_name": "Genus (Superspecies) species subforma subform",
    },
    {
        "name_version": "Infragenus with rank",
        "formatted_name": "Genus (supersp. Superspecies) species subforma subform",
    },
    {
        "name_version": "Infragenus without parentheses",
        "formatted_name": "Genus supersp. Superspecies species subforma subform",
    },
    {
        "name_version": "Infragenus without parentheses without rank",
        "formatted_name": "Genus Superspecies species subform",
    },
    {
        "name_version": "Full hierarchy",
        "formatted_name": "Genus supersp. Superspecies species subforma subform",
    },
]
name_set_minimum_highest_hierarchy_162763 = [
    {"name_version": "Canonical", "formatted_name": "Genus species subsp. subspecies"},
    {
        "name_version": "Canonical without rank",
        "formatted_name": "Genus species subspecies",
    },
    {
        "name_version": "Infragenus",
        "formatted_name": "Genus (Subgenus) species subsp. subspecies",
    },
    {
        "name_version": "Infragenus with rank",
        "formatted_name": "Genus (subg. Subgenus) species subsp. subspecies",
    },
    {
        "name_version": "Infragenus without parentheses",
        "formatted_name": "Genus subg. Subgenus species subsp. subspecies",
    },
    {
        "name_version": "Infragenus without parentheses without rank",
        "formatted_name": "Genus Subgenus species subspecies",
    },
    {
        "name_version": "Full hierarchy",
        "formatted_name": "Genus subg. Subgenus species subsp. subspecies",
    },
]
name_set_mixed_medium_hierarchy_162765 = [
    {"name_version": "Canonical", "formatted_name": "Genus species subvar. subvariety"},
    {
        "name_version": "Canonical without rank",
        "formatted_name": "Genus species subvariety",
    },
    {
        "name_version": "Infragenus",
        "formatted_name": "Genus (Subsection) species subvar. subvariety",
    },
    {
        "name_version": "Infragenus with rank",
        "formatted_name": "Genus (subsect. Subsection) species subvar. subvariety",
    },
    {
        "name_version": "Infragenus without parentheses",
        "formatted_name": "Genus subsect. Subsection species subvar. subvariety",
    },
    {
        "name_version": "Infragenus without parentheses without rank",
        "formatted_name": "Genus Subsection species subvariety",
    },
    {
        "name_version": "Full hierarchy",
        "formatted_name": (
            "Genus subg. Subgenus sect. Section subsect. Subsection species subsp."
            " subspecies var. variety subvar. subvariety"
        ),
    },
]
name_set_invalid_minimum_lowest_hierarchy_162767 = [
    {"name_version": "Canonical", "formatted_name": "Genus species"},
    {"name_version": "Canonical without rank", "formatted_name": "Genus species"},
    {"name_version": "Infragenus", "formatted_name": "Genus (Superspecies) species"},
    {
        "name_version": "Infragenus with rank",
        "formatted_name": "Genus (supersp. Superspecies) species",
    },
    {
        "name_version": "Infragenus without parentheses",
        "formatted_name": "Genus supersp. Superspecies species",
    },
    {
        "name_version": "Infragenus without parentheses without rank",
        "formatted_name": "Genus Superspecies species",
    },
    {
        "name_version": "Full hierarchy",
        "formatted_name": "Genus supersp. Superspecies species",
    },
]
