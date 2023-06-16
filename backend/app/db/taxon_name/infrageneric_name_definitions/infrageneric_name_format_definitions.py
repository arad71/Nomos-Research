from app.db.taxon_name.infrageneric_name_definitions.\
    infrageneric_name_source_definitions import \
    source_for_genus, \
    source_for_species, \
    sources_below_species, \
    sources_between_genus_and_species

"""
JSON name descriptions for defining displayed names of taxon entries.
See SubGeneraNameDefinitions class description for details on how to define a new name.
"""

name_format_canonical = {
                "name_version": "Canonical",
                "example": "Verticordia staminosa var. erecta",
                "name_components": [
                        {
                            "word_order_placement": 1,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": True,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_below_species,
                        }
                    ]
                }

name_format_canonical_without_rank = {
                "name_version": "Canonical without rank",
                "example": "Verticordia staminosa erecta",
                "name_components": [
                        {
                            "word_order_placement": 1,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_below_species,
                        }
                    ]
                }

name_format_infragenus = {
                "name_version": "Infragenus",
                "example": "Verticordia (Veryfrillycordia) staminosa var. erecta",
                "name_components": [
                        {
                            "word_order_placement": 1,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  True,
                            "source": sources_between_genus_and_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 4,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": True,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_below_species,
                        }
                    ]
                }

name_format_infragenus_with_rank = {
                "name_version": "Infragenus with rank",
                "example": "Verticordia (sect. Veryfrillycordia) staminosa var. erecta",
                "name_components": [
                        {
                            "word_order_placement": 1,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": True,
                            "name_is_abbreviated": False,
                            "has_parentheses":  True,
                            "source": sources_between_genus_and_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 4,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": True,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_below_species,
                        }
                    ]
                }

name_format_infragenus_without_parentheses = {
                "name_version": "Infragenus without parentheses",
                "example": "Verticordia sect. Veryfrillycordia staminosa var. erecta",
                "name_components": [
                        {
                            "word_order_placement": 1,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": True,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_between_genus_and_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 4,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": True,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_below_species,
                        }
                    ]
                }

name_format_abbreviated_genus = {
                "name_version": "Canonical",
                "example": "V. staminosa var. erecta",
                "name_components": [
                        {
                            "word_order_placement": 1,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": True,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": False,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "use_rank_abbreviation": True,
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_below_species,
                        }
                    ]
                }

name_format_the_lot = "TODO"

all_name_combinations = [name_format_canonical,
                         name_format_canonical_without_rank,
                         name_format_infragenus,
                         name_format_infragenus_with_rank,
                         name_format_infragenus_without_parentheses,
                         name_format_abbreviated_genus]
