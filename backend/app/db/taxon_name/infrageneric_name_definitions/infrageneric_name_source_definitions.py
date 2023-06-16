"""
JSON source descriptions for defining displayed names of taxon entries.
See SubGeneraNameDefinitions class description for details on how to define a new name.
"""

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
