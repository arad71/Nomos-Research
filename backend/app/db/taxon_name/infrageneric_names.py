from typing import Any, List, Optional, Tuple
from pydantic import BaseModel
from app.db.taxon_name.infrageneric_name_definitions.infrageneric_name import \
    SubGeneraNameDefinitions, Source, NameComponent
from app.db.taxon_name.infrageneric_name_definitions.infrageneric_name_format_definitions import \
    all_name_combinations
from app.db.taxon_rank.enums import RankAbbreviationVals


class InfraGenericNameModel(BaseModel):
    formatted_name: str = ""
    name_version: str = ""
    contributing_taxon_ids: List[int] = []
    info: Optional[str] = None
    searched_taxon_id: int = None


class NameComponentModel(BaseModel):
    name_value: str = ""
    taxon_name_id: Optional[int] = None
    info: Optional[str] = None


class NameComponentsListModel(BaseModel):
    value: Optional[str] = None
    rank_abbreviation: Optional[str] = None
    preference_tuple: Optional[Tuple[int, int]] = None
    taxon_name_id: Optional[int] = None


class DefinitionComponentsListModel(BaseModel):
    hierarchy_rank: Optional[str] = None
    column_label: Optional[str] = None
    preference_tuple: Optional[Tuple[int, int]] = None


class InfraGenericNames(BaseModel):
    name_definitions: SubGeneraNameDefinitions = None
    formatted_names: List[InfraGenericNameModel] = []

    def __init__(self, **data: Any):
        super().__init__(**data)
        self.name_definitions = SubGeneraNameDefinitions(definitions_list=all_name_combinations)

    def generate_names(self, searched_taxon_id: int, taxon_info: List[dict]):
        for definition in self.name_definitions.definitions_list:

            name_definition_components_sorted = sorted(definition.name_components,
                                            key=lambda x: x.word_order_placement)
            new_name = InfraGenericNameModel()
            new_name.name_version = definition.name_version
            new_name.searched_taxon_id = searched_taxon_id

            generated_name = ""
            for definition_component in name_definition_components_sorted:
                if definition_component.static_string.is_static:
                    generated_name += definition_component.static_string.value + " "
                    continue
                name_component_list = self._get_name_components(definition_component.source, taxon_info)
                name_component = self._select_name_component(definition_component, name_component_list)
                if name_component.info is not None:
                    new_name.info = f"{name_component.info}: Component " \
                                    f"[{definition_component.word_order_placement}]" \
                                    f", reference Taxon name ID " \
                                    f"[{name_component.taxon_name_id}]"
                    generated_name = ""
                    break
                else:
                    new_name.contributing_taxon_ids.append(name_component.taxon_name_id)
                    generated_name = generated_name + name_component.name_value
            new_name.formatted_name = generated_name.strip().rstrip()
            self.formatted_names.append(new_name)
        return self.formatted_names


    @staticmethod
    def _get_name_components(component_sources: List[Source],
                             taxon_info: List[dict]) -> List[NameComponentsListModel]:
        definition_components_list = [
            DefinitionComponentsListModel(
                hierarchy_rank=source.hierarchy_rank,
                column_label=field.label,
                preference_tuple=(source.preference, field.preference)
            )
            for source in component_sources
            for field in source.field
        ]
        name_components_list = [
            NameComponentsListModel(
                value=taxon[definition.column_label],
                rank_abbreviation=taxon["rank_abbrev"],
                preference_tuple=definition.preference_tuple,
                taxon_name_id=taxon["taxon_name_id"]
            )
            for definition in definition_components_list
            for taxon in taxon_info
            if taxon["rank_name"] == definition.hierarchy_rank
               and taxon[definition.column_label]
        ]

        return name_components_list

    @staticmethod
    def _select_name_component(definition_component: NameComponent,
                               name_component_list: List[NameComponentsListModel],
                               ) -> NameComponentModel:
        name_component = NameComponentModel()
        if not name_component_list:
            if definition_component.is_optional:
                name_component.name_value = ""
                return name_component
            else:
                name_component.info = "Mandatory name component does not exist"
                return name_component

        action = "Source sorting"
        try:
            name_component_source = sorted(name_component_list,
                                           key=lambda x: x.preference_tuple)[0]
            action = "Value setting"
            name_component.taxon_name_id = name_component_source.taxon_name_id
            action = "Name value string"
            name_value = name_component_source.value.strip().rstrip()
            if definition_component.name_is_abbreviated:
                action = "Name value abbreviation"
                name_value = name_value[0]
            if definition_component.use_rank_abbreviation:
                action = "Rank abbreviation"
                name_abbreviation = name_component_source.rank_abbreviation.strip().rstrip()
                rank_abbreviation = RankAbbreviationVals[name_abbreviation].strip().rstrip()
                name_value = rank_abbreviation + " " + name_value
            if definition_component.has_parentheses:
                action = "Parentheses"
                name_value = "(" + name_value + ")"
            name_component.name_value = name_value + " "

        except AttributeError:
            name_component.info = \
                f"Attribute Error encountered with component [{action}]"

        except Exception as e:
            name_component.info = \
                f"Unexpected Error [{e}] encountered with component [{action}]"

        return name_component




