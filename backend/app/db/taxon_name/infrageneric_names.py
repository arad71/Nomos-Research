from operator import itemgetter
from typing import Any, List

from pydantic import BaseModel, Field

from app.db.taxon_rank.enums import RankAbbreviationVals


class InfragenericNames(BaseModel):
    name_definitions: List[dict] = Field(description="formats")

    def __init__(self, **data: Any):
        super().__init__(**data)
        # Canonical Name: Verticordia staminosa var. erecta


        self.name_definitions = [{
            "name": "canonical_with_rank",
            "name_components": [
                {
                    "word_order_placement": 1,
                    "optional": False,
                    "static_string": {"is_static": False, "value": ""},
                    "rank_abbreviation": {"has_abbreviation": False},
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
                    "rank_abbreviation": {"has_abbreviation": False},
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
                    "word_order_placement": 4,
                    "optional": False,
                    "static_string": {"is_static": False, "value": ""},
                    "rank_abbreviation": {"has_abbreviation": True},
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
            },
            {
                "name": "canonical",
                "name_components": [
                    {
                        "word_order_placement": 1,
                        "optional": False,
                        "static_string": {"is_static": False, "value": ""},
                        "rank_abbreviation": {"has_abbreviation": False},
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
                        "rank_abbreviation": {"has_abbreviation": False},
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
                        "static_string": {"is_static": False, "value": ""},
                        "rank_abbreviation": {"has_abbreviation": True},
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
        ]

        result = [{"version": "canonical_with_rank", "name": "Verticordia staminosa var. erecta"},
            {"version": "canonical", "name": "Verticordia staminosa subvar. erecta"}]

    def get_source_data(self):
        pass

    def generate_names(self, taxon_info):
        names = []
        for definition in self.name_definitions:
            name_components_sorted = sorted(definition["name_components"],
                                            key=itemgetter("word_order_placement"))
            version = definition["name"]

            generated_name = ""
            for component in name_components_sorted:
                if component["static_string"]["is_static"]:
                    generated_name += component["static_string"]["value"] + " "
                    continue
                name_component_list = self._get_name_components(component["source"], taxon_info)
                name_component = self._select_name_component(name_component_list, component)

            names.append({"version": version, "name": generated_name})

        return names


    @staticmethod
    def _get_name_components(self,
                            component_sources: List[dict],
                            taxon_info: List[dict])-> List[dict]:
        definition_search_list = \
            [{"hierarchy_rank": source["hierarchy_rank"],
              "column_label": field["label"],
              "preference_tuple": (source["preference"], field["preference"])}
             for source in component_sources
             for field in source["field"]]

        results_list = \
            [{"value": taxon[definition["column_label"]],
              "rank_abbreviation": taxon["rank_abbrev"],
              "preference_tuple": definition["preference_tuple"],
              "taxon_name_id": taxon["taxon_name_id"]}
         for definition in definition_search_list
            for taxon in taxon_info
                if taxon["rank_name"] == definition["hierarchy_rank"]
                and taxon[definition["column_label"]]
         ]

        return results_list

    def _select_name_component(self, name_component_list: List[dict], component: dict) -> dict:
        if not name_component_list:
            return {"name": "", "taxon_name_id": None} if component["optional"] else None

        name_component_entry = sorted(name_component_list, key=itemgetter("preference_tuple"))[0]
        name = name_component_entry["value"]
        if component["rank_abbreviation"]["has_abbreviation"]:
            name = RankAbbreviationVals(name_component_entry["rank_abbreviation"]) + " " + name
        name = name.strip().lstrip() + " "


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


