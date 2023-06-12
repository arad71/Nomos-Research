from typing import Any, List

from pydantic import BaseModel, Field


class InfragenericNames(BaseModel):
    name_formats: List[dict] = Field(description="formats")

    def __init__(self, **data: Any):
        super().__init__(**data)
        # Canonical Name: Verticordia staminosa var. erecta


        self.name_formats = [{
            "name": "canonical_with_rank",
            "name_components": [
                {
                    "word_order_placement": 1,
                    "optional": False,
                    "static_string": {"is_static": False, "value": ""},
                    "source": [
                        {
                            "hierarchy_rank": "Genus",
                            "preference": 1,
                            "field": [
                                {"label": "uninomial", "preference": 1}
                            ]
                        }
                    ]
                },
                {
                    "word_order_placement": 2,
                    "optional": False,
                    "static_string": {"is_static": False, "value": ""},
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
                    "optional": False,
                    "static_string": {"is_static": True, "value": "var."},
                    "source": []
                },
                {
                    "word_order_placement": 4,
                    "optional": False,
                    "static_string": {"is_static": False, "value": ""},
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
                },
                {
                    "word_order_placement": 99,
                    "optional": False,
                    "static_string": {"is_static": True, "value": ""},
                    "source": [
                        {
                            "hierarchy_rank": "",
                            "preference": 99,
                            "field": [
                                {"label": "", "preference": 99}
                            ]
                        }
                    ],
                },
                ]
            }
        ]

    def get_source_data(self):
        pass

    def generate_names(self):
        pass

thing = [{"taxon_name_id": 26680,
          "path": "1.26680",
          "scientific_name": "Magnoliophyta",
          "uninomial": "Magnoliophyta",
          "specific_epithet": None,
          "infraspecific_epithet": None,
          "rank_name": "Division",
          "parent_nid": 20263},




         {"taxon_name_id": 26690, "path": "1.26680.26690", "scientific_name": "Magnoliopsida", "uninomial": "Magnoliopsida", "specific_epithet": None, "infraspecific_epithet": None, "rank_name": "Class", "parent_nid": 26680},
         {"taxon_name_id": 25053, "path": "1.26680.26690.25053", "scientific_name": "Myrtales", "uninomial": "Myrtales", "specific_epithet": None, "infraspecific_epithet": None, "rank_name": "Order", "parent_nid": 26690},
         {"taxon_name_id": 24288, "path": "1.26680.26690.25053.24288", "scientific_name": "Myrtaceae Juss.", "uninomial": "Myrtaceae", "specific_epithet": None, "infraspecific_epithet": None, "rank_name": "Family", "parent_nid": 25053},
         {"taxon_name_id": 164951, "path": "1.26680.26690.25053.24288.164951", "scientific_name": "Verticordia", "uninomial": "Verticordia", "specific_epithet": None, "infraspecific_epithet": None, "rank_name": "Genus", "parent_nid": 24288},
         {"taxon_name_id": 164957, "path": "1.26680.26690.25053.24288.164951.164957", "scientific_name": "Verticordia Frillycordia", "uninomial": "Verticordia", "specific_epithet": "Frillycordia", "infraspecific_epithet": None, "rank_name": "Subgenus", "parent_nid": 164951},
         {"taxon_name_id": 164958, "path": "1.26680.26690.25053.24288.164951.164957.164958", "scientific_name": "Verticordia Veryfrillycordia", "uninomial": "Verticordia", "specific_epithet": "Veryfrillycordia", "infraspecific_epithet": None, "rank_name": "Section", "parent_nid": 164957},
         {"taxon_name_id": 164959, "path": "1.26680.26690.25053.24288.164951.164957.164958.164959", "scientific_name": "Verticordia Staminosa", "uninomial": "Verticordia", "specific_epithet": "Staminosa", "infraspecific_epithet": None, "rank_name": "Species", "parent_nid": 164958},
         {"taxon_name_id": 164960, "path": "1.26680.26690.25053.24288.164951.164957.164958.164959.164960", "scientific_name": "Verticordia Staminosa Staminosa", "uninomial": "Verticordia", "specific_epithet": "Staminosa", "infraspecific_epithet": "Staminosa", "rank_name": "Subspecies", "parent_nid": 164959},

         {"taxon_name_id": 164961,
          "path": "1.26680.26690.25053.24288.164951.164957.164958.164959.164960.164961",
          "scientific_name": "Verticordia Staminosa Erecta",
          "uninomial": "Verticordia",
          "specific_epithet": "Staminosa",
          "infraspecific_epithet": "Erecta",
          "rank_name": "Variety",
          "parent_nid": 164960}]
