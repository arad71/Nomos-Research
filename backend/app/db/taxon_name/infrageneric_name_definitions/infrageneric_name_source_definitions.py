"""
JSON source descriptions for defining displayed names of taxon entries.
See SubGeneraNameDefinitions class description for details on how to define a new name.
"""

sources_below_species = [
                            {
                                "hierarchy_rank": "Subform",
                                "preference": 1,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            },
                            {
                                "hierarchy_rank": "Form",
                                "preference": 2,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            },
                            {
                                "hierarchy_rank": "Subvariety",
                                "preference": 3,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            },
                            {
                                "hierarchy_rank": "Variety",
                                "preference": 4,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            },
                            {
                                "hierarchy_rank": "Subspecies",
                                "preference": 5,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            }
                        ]

sources_between_genus_and_species = [
                                        {
                                            "hierarchy_rank": "Superseries",
                                            "preference": 1,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Subseries",
                                            "preference": 2,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Series",
                                            "preference": 3,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Subsection",
                                            "preference": 4,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Section",
                                            "preference": 5,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        },
                                        {
                                            "hierarchy_rank": "Subgenus",
                                            "preference": 6,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        }
                                    ]

source_genus = [
                        {
                            "hierarchy_rank": "Genus",
                            "preference": 1,
                            "field": [
                                {"label": "uninomial", "preference": 1}
                            ]
                        }
                    ]

source_species = [
                        {
                            "hierarchy_rank": "Species",
                            "preference": 1,
                            "field": [
                                {"label": "specific_epithet", "preference": 1}
                            ]
                        }
                    ]


"""
Independent sources between genus and species, and below species.
Used exclusively for the full hierarchy name.
"""
source_superspecies = [{
                                            "hierarchy_rank": "Superspecies",
                                            "preference": 1,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        }]

source_subseries = [{
                                            "hierarchy_rank": "Subseries",
                                            "preference": 1,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        }]

source_series = [{
                                            "hierarchy_rank": "Series",
                                            "preference": 1,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        }]

source_subsection = [{
                                            "hierarchy_rank": "Subsection",
                                            "preference": 1,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        }]

source_section = [{
                                            "hierarchy_rank": "Section",
                                            "preference": 1,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        }]

source_subgenus = [{
                                            "hierarchy_rank": "Subgenus",
                                            "preference": 1,
                                            "field": [
                                                {"label": "uninomial", "preference": 1}
                                            ]
                                        }]

source_subform = [{
                                "hierarchy_rank": "Subform",
                                "preference": 1,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            }]

source_form = [{
                                "hierarchy_rank": "Form",
                                "preference": 1,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            }]

source_subvariety = [{
                                "hierarchy_rank": "Subvariety",
                                "preference": 1,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            }]

source_variety = [{
                                "hierarchy_rank": "Variety",
                                "preference": 1,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            }]

source_subspecies = [{
                                "hierarchy_rank": "Subspecies",
                                "preference": 1,
                                "field": [
                                    {"label": "infraspecific_epithet",
                                     "preference": 1}
                                ]
                            }]
