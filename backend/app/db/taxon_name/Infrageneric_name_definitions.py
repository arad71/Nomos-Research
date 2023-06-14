sources_below_species = [
                            {
                                "hierarchy_rank": "Form",
                                "preference": 1,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            },
                            {
                                "hierarchy_rank": "Subvariety",
                                "preference": 2,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            },
                            {
                                "hierarchy_rank": "Variety",
                                "preference": 3,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            },
                            {
                                "hierarchy_rank": "Subspecies",
                                "preference": 4,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            }
                        ]

sources_between_genus_and_species = [
                                        {
                                            "hierarchy_rank": "Subseries",
                                            "preference": 1,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Series",
                                            "preference": 2,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Subsection",
                                            "preference": 3,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Section",
                                            "preference": 4,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Subgenus",
                                            "preference": 5,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        }
                                    ]

source_for_species = [
                        {
                            "hierarchy_rank": "Species",
                            "preference": 1,
                            "field": [
                                {"label": "specific_epithet", "preference": 1}
                            ]
                        }
                    ]

source_for_genus = [
                        {
                            "hierarchy_rank": "Genus",
                            "preference": 1,
                            "field": [
                                {"label": "uninomial", "preference": 1}
                            ]
                        }
                    ]

name_format_canonical = {
                "name_version": "Canonical",
                "example": "Verticordia staminosa var. erecta",
                "name_components": [
                        {
                            "word_order_placement": 1,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": True},
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
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
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
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  True,
                            "source": sources_between_genus_and_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 4,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": True},
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
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": True},
                            "name_is_abbreviated": False,
                            "has_parentheses":  True,
                            "source": sources_between_genus_and_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 4,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": True},
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
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": True},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_between_genus_and_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 4,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": True},
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
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": True,
                            "has_parentheses":  False,
                            "source": source_for_genus
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": source_for_species,
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": True},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": sources_below_species,
                        }
                    ]
                }

name_format_the_lot = "TODO"
fail_case = {
                    "name_version": "canonical_that_fails",
                    "name_components": [
                        {
                            "word_order_placement": 1,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":    False,
                            "source": [
                                {
                                    "hierarchy_rank": "Genus",
                                    "preference": 1,
                                    "field": [
                                        {"label": "specific_epithet", "preference": 1}
                                    ]
                                }
                            ]
                        },
                        {
                            "word_order_placement": 2,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":   False,
                            "source": [
                                {
                                    "hierarchy_rank": "Species",
                                    "preference": 1,
                                    "field": [
                                        {"label": "specific_epithet", "preference": 1},
                                        {"label": "uninomial", "preference": 2}
                                    ]
                                }
                            ],
                        },
                        {
                            "word_order_placement": 3,
                            "is_optional": False,
                            "static_string": {"is_static": False, "value": ""},
                            "rank_abbreviation": {"has_abbreviation": False},
                            "name_is_abbreviated": False,
                            "has_parentheses":  False,
                            "source": [
                                {
                                    "hierarchy_rank": "Sub-variety",
                                    "preference": 1,
                                    "field": [
                                        {"label": "infraspecific_epithet", "preference": 1},
                                        {"label": "uninomial", "preference": 2}]},
                                {
                                    "hierarchy_rank": "Variety",
                                    "preference": 2,
                                    "field": [
                                        {"label": "infraspecific_epithet", "preference": 1},
                                        {"label": "uninomial", "preference": 2}]}
                            ],
                        }
                    ]
                }


name_combinations = [name_format_canonical,
name_format_canonical_without_rank,
name_format_infragenus,
name_format_infragenus_with_rank,
name_format_infragenus_without_parentheses,
name_format_abbreviated_genus]
