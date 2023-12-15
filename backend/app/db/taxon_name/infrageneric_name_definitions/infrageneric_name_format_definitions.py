"""
JSON name descriptions for defining displayed names of taxon entries.
See SubGeneraNameDefinitions class description for details on how to define a new name.
"""

from enum import Enum

from ..infrageneric_name_definitions import (
    infrageneric_name_source_definitions as definitions,
)


class PlacementType(Enum):
    STANDARD = "@STANDARD_AUTHOR_PLACEMENT"
    AUTONYM = "@AUTONYM_AUTHOR_PLACEMENT"


name_format_canonical = {
    "id": 1,
    "name_version": "Canonical",
    "example": "Verticordia staminosa var. erecta",
    "name_components": [
        {
            "word_order_placement": 1,
            "is_optional": False,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_genus_or_uninomial,
        },
        {
            "word_order_placement": 2,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_species,
        },
        {
            "word_order_placement": 3,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.sources_below_species,
        },
    ],
}

name_format_canonical_without_rank = {
    "id": 2,
    "name_version": "Canonical without rank",
    "example": "Verticordia staminosa erecta",
    "name_components": [
        {
            "word_order_placement": 1,
            "is_optional": False,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_genus_or_uninomial,
        },
        {
            "word_order_placement": 2,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_species,
        },
        {
            "word_order_placement": 3,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.sources_below_species,
        },
    ],
}

name_format_infragenus = {
    "id": 3,
    "name_version": "Infragenus",
    "example": "Verticordia (Veryfrillycordia) staminosa var. erecta",
    "name_components": [
        {
            "word_order_placement": 1,
            "is_optional": False,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_genus_or_uninomial,
        },
        {
            "word_order_placement": 2,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": True,
            "source": definitions.sources_between_genus_and_species,
        },
        {
            "word_order_placement": 3,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_species,
        },
        {
            "word_order_placement": 4,
            "static_string": {
                "is_static": True,
                "value": PlacementType.AUTONYM.value,
            },
            "has_parentheses": False,
        },
        {
            "word_order_placement": 5,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.sources_below_species,
        },
        {
            "word_order_placement": 6,
            "static_string": {
                "is_static": True,
                "value": PlacementType.STANDARD.value,
            },
            "has_parentheses": False,
        },
    ],
}

name_format_infragenus_with_rank = {
    "id": 4,
    "name_version": "Infragenus with rank",
    "example": "Verticordia (sect. Veryfrillycordia) staminosa var. erecta",
    "name_components": [
        {
            "word_order_placement": 1,
            "is_optional": False,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_genus_or_uninomial,
        },
        {
            "word_order_placement": 2,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": True,
            "source": definitions.sources_between_genus_and_species,
        },
        {
            "word_order_placement": 3,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_species,
        },
        {
            "word_order_placement": 4,
            "static_string": {
                "is_static": True,
                "value": PlacementType.AUTONYM.value,
            },
            "has_parentheses": False,
        },
        {
            "word_order_placement": 5,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.sources_below_species,
        },
        {
            "word_order_placement": 6,
            "static_string": {
                "is_static": True,
                "value": PlacementType.STANDARD.value,
            },
            "has_parentheses": False,
        },
    ],
}

name_format_infragenus_without_parentheses = {
    "id": 5,
    "name_version": "Infragenus without parentheses",
    "example": "Verticordia sect. Veryfrillycordia staminosa var. erecta",
    "name_components": [
        {
            "word_order_placement": 1,
            "is_optional": False,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_genus_or_uninomial,
        },
        {
            "word_order_placement": 2,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.sources_between_genus_and_species,
        },
        {
            "word_order_placement": 3,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_species,
        },
        {
            "word_order_placement": 4,
            "static_string": {
                "is_static": True,
                "value": PlacementType.AUTONYM.value,
            },
            "has_parentheses": False,
        },
        {
            "word_order_placement": 5,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.sources_below_species,
            "target": "infraspecific_epithet",
        },
        {
            "word_order_placement": 6,
            "static_string": {
                "is_static": True,
                "value": PlacementType.STANDARD.value,
            },
            "has_parentheses": False,
        },
    ],
}

name_format_infragenus_without_parentheses_without_rank = {
    "id": 6,
    "name_version": "Infragenus without parentheses without rank",
    "example": "Verticordia Veryfrillycordia staminosa erecta",
    "name_components": [
        {
            "word_order_placement": 1,
            "is_optional": False,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_genus_or_uninomial,
        },
        {
            "word_order_placement": 2,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.sources_between_genus_and_species,
        },
        {
            "word_order_placement": 3,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_species,
        },
        {
            "word_order_placement": 4,
            "static_string": {
                "is_static": True,
                "value": PlacementType.AUTONYM.value,
            },
            "has_parentheses": False,
        },
        {
            "word_order_placement": 5,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.sources_below_species,
        },
        {
            "word_order_placement": 6,
            "static_string": {
                "is_static": True,
                "value": PlacementType.STANDARD.value,
            },
            "has_parentheses": False,
        },
    ],
}

name_format_full_hierarchy = {
    "id": 7,
    "name_version": "Full hierarchy",
    "example": (
        "Verticordia subg. Frillycordia sect. Veryfrillycordia staminosa subsp."
        " staminosa var. erecta"
    ),
    "name_components": [
        {
            "word_order_placement": 1,
            "is_optional": False,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_genus_or_uninomial,
        },
        {
            "word_order_placement": 2,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_subgenus,
        },
        {
            "word_order_placement": 3,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_section,
        },
        {
            "word_order_placement": 4,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_subsection,
        },
        {
            "word_order_placement": 5,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_series,
        },
        {
            "word_order_placement": 6,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_subseries,
        },
        {
            "word_order_placement": 7,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_superspecies,
        },
        {
            "word_order_placement": 8,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": False,
            "has_parentheses": False,
            "source": definitions.source_species,
        },
        {
            "word_order_placement": 9,
            "static_string": {
                "is_static": True,
                "value": PlacementType.AUTONYM.value,
            },
            "has_parentheses": False,
        },
        {
            "word_order_placement": 10,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_subspecies,
        },
        {
            "word_order_placement": 11,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_variety,
        },
        {
            "word_order_placement": 12,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_subvariety,
        },
        {
            "word_order_placement": 13,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_form,
        },
        {
            "word_order_placement": 14,
            "is_optional": True,
            "static_string": {"is_static": False},
            "use_rank_abbreviation": True,
            "has_parentheses": False,
            "source": definitions.source_subform,
        },
        {
            "word_order_placement": 15,
            "static_string": {
                "is_static": True,
                "value": PlacementType.STANDARD.value,
            },
            "has_parentheses": False,
        },
    ],
}

all_name_combinations = [
    name_format_canonical,
    name_format_canonical_without_rank,
    name_format_infragenus,
    name_format_infragenus_with_rank,
    name_format_infragenus_without_parentheses,
    name_format_infragenus_without_parentheses_without_rank,
    name_format_full_hierarchy,
]
