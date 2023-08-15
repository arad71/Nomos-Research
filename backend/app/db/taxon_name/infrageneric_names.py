from typing import List, Optional, Tuple

from pydantic import BaseModel

from app.db.taxon_name.infrageneric_name_definitions.infrageneric_name import (
    NameComponent,
    Source,
    SubGeneraNameDefinitions,
)
from app.db.taxon_name.infrageneric_name_definitions.infrageneric_name_format_definitions import (
    all_name_combinations,
)
from app.db.taxon_rank.enums import RankAbbreviationVals


class InfraGenericNameModel(BaseModel):
    """
    Represents an infra-generic name model.

    This class holds the result of a single formatted name
    """

    id: int
    formatted_name: str = ""
    name_version: str = ""
    author: Optional[str] = None
    formatted_name_with_author: Optional[str] = None
    contributing_taxon_names: List[Tuple[int, str]] = []
    info: Optional[str] = None
    searched_taxon_id: int = None


class NameComponentModel(BaseModel):
    """
    Represents a name component model.

    This class holds an individual word during the name creation process.
    Storing the word that was selected, the id of the taxon entry that contained the
    word, and error information logged during the selection of the word.
    """

    name_value: str = ""
    source_name_value: Optional[str] = None
    taxon_name_id: Optional[int] = None
    info: Optional[str] = None


class NameComponentsListModel(BaseModel):
    """
    Represents a list of name components.

    This class holds a combination of definition and query information.
    When a word is identified as being a possible name component, the word information
    is stored here. The value, rank abbreviation, and taxon id are stored from the
    query, the word preference is stored from the definition.
    """

    value: Optional[str] = None
    rank_abbreviation: Optional[str] = None
    preference_tuple: Optional[Tuple[int, int]] = None
    taxon_name_id: Optional[int] = None


class DefinitionComponentsListModel(BaseModel):
    """
    Represents a list of definition components.

    This class holds a definition word option. The defined hierarchy rank and column
    label are used to select a word from the query data (i.e. Genus.uninomial) and the
    preference is used for later word option selection.
    """

    hierarchy_rank: Optional[str] = None
    column_label: Optional[str] = None
    preference_tuple: Optional[Tuple[int, int]] = None


class InfraGenericNames:
    """
    Generates defined InfraGeneric names.

    This class uses pre-defined name definitions to generate a series of names from a
    single taxon id query where the full taxon hierarchy information is provided.
    """

    name_definitions = SubGeneraNameDefinitions(definitions_list=all_name_combinations)

    @staticmethod
    def _validate_taxon_info(taxon_info: List[dict]) -> bool:
        """
        Validates that all expected fields exist in the taxon_info dictionary.

        Args:
            taxon_info (List[Dict[str, Any]]): Information about the taxon.

        Returns:
            bool: True if all expected fields exist, False otherwise.
        """
        expected_fields = {
            "taxon_name_id",
            "rank_name",
            "rank_abbrev",
            "uninomial",
            "specific_epithet",
            "infraspecific_epithet",
        }

        for taxon in taxon_info:
            if not all(field in taxon for field in expected_fields):
                return False

        return True

    @classmethod
    def generate_names(
        cls, searched_taxon_id: int, taxon_info: List[dict]
    ) -> List[InfraGenericNameModel]:
        """
        Generates infra-generic names based on the provided query results and the
        specified name format definitions.

        Args:
            searched_taxon_id (int): The ID of the searched taxon.
            taxon_info (List[dict]): Query result from the taxon_id entry

        Returns:
            List[InfraGenericNameModel]: The generated infra-generic names.
        """
        # start with an empty results list
        formatted_names = []

        # abort the process if something somehow went wrong with the query data
        if not cls._validate_taxon_info(taxon_info):
            new_name = InfraGenericNameModel(
                info="Error: Query information is missing required fields.",
                formatted_name="",
            )
            formatted_names.append(new_name)
            return formatted_names

        # record author information for later use
        searched_taxon_dict = next(
            filter(lambda d: d.get("taxon_name_id") == searched_taxon_id, taxon_info),
            None,
        )
        taxon_author = (
            searched_taxon_dict.get("author") if searched_taxon_dict else None
        )

        # process each defined name included in the "all_names" list
        for definition in cls.name_definitions.definitions_list:
            # make sure the name components are processed in order
            name_definition_components_sorted = sorted(
                definition.name_components, key=lambda x: x.word_order_placement
            )

            # set generic new name attributes
            new_name = InfraGenericNameModel(
                id=definition.id,
                name_version=definition.name_version,
                searched_taxon_id=searched_taxon_id,
            )
            generated_name = ""

            # process all the individual components of the name to build it up
            for definition_component in name_definition_components_sorted:
                # Static words are set first
                if definition_component.static_string.is_static:
                    generated_name += definition_component.static_string.value + " "
                    # Move on to the next component if we just processed a static word
                    continue
                # Get all the possible options for the component word
                name_component_list = cls._get_name_components(
                    definition_component.source, taxon_info
                )
                # Select one single word from all possible components
                name_component = cls._select_name_component(
                    definition_component, name_component_list
                )
                # Handle errors in the component selection process
                # the info field should only be populated if there was a problem
                if name_component.info is not None:
                    new_name.info = (
                        f"{name_component.info}: Component number"
                        f" [{definition_component.word_order_placement}], Defined"
                        f" source options [{definition_component.sources_summary},"
                        f" Reference Taxon name ID [{name_component.taxon_name_id}]."
                    )
                    # erase the name progress, don't return names with problems
                    generated_name = ""
                    break
                else:
                    # Optional componentes that don't exist won't have a contribution
                    if (
                        name_component.taxon_name_id
                        and name_component.source_name_value
                    ):
                        # record the taxon id that is contributing this word
                        new_name.contributing_taxon_names.append(
                            (
                                name_component.taxon_name_id,
                                name_component.source_name_value,
                            )
                        )
                        # update the in-progress name
                        generated_name = generated_name + name_component.name_value
            # remove any leading/trailing white space and add the formatted name
            new_name.formatted_name = generated_name.strip()
            if taxon_author:
                new_name.author = taxon_author
                new_name.formatted_name_with_author = (
                    new_name.formatted_name + " " + taxon_author
                )
            formatted_names.append(new_name)
        return formatted_names

    @staticmethod
    def _get_name_components(
        component_sources: List[Source], taxon_info: List[dict]
    ) -> List[NameComponentsListModel]:
        """
        Gets the name components based on the component sources and taxon info.

        A name component is the row from the query result where the taxon rank name
        matches a rank name specified in the sources list. All matches are returned,
        match selection logic is performed elsewhere.

        Args:
            component_sources (List[Source]): The component sources
            taxon_info (List[dict]): Information about the taxon.

        Returns:
            List[NameComponentsListModel]: The name components.
        """
        # this section creates a flat list of preference sources from the definition
        # json. This is required because there could be multiple valid sources to choose
        # from, and each source could have multiple valid fields to choose from.
        # In order to keep track of the priority for each item, the two preferences are
        # treated as a major/minor preference indicator as a tuple. This way, preference
        # (1,7) will be chosen over preference (2,1) when selecting word preferences.
        definition_components_list = [
            DefinitionComponentsListModel(
                hierarchy_rank=source.hierarchy_rank,
                column_label=field.label,
                preference_tuple=(source.preference, field.preference),
            )
            for source in component_sources
            for field in source.field
        ]

        # This section creates a list of the word options that can be used for word
        # selection in later steps. If the hierarchy rank was defined as a valid option
        # in the definition, and the hierarchy rank exists in the taxon query data,
        # and the field for that rank (uninomial, etc) is populated,
        # then the information is saved to the list.
        name_components_list = [
            NameComponentsListModel(
                value=taxon[definition.column_label],
                rank_abbreviation=taxon["rank_abbrev"],
                preference_tuple=definition.preference_tuple,
                taxon_name_id=taxon["taxon_name_id"],
            )
            for definition in definition_components_list
            for taxon in taxon_info
            if taxon["rank_name"] == definition.hierarchy_rank
            and taxon[definition.column_label]
        ]

        return name_components_list

    @staticmethod
    def _select_name_component(
        definition_component: NameComponent,
        name_component_list: List[NameComponentsListModel],
    ) -> NameComponentModel:
        """
        Selects the name component based on the definition component and name component list.

        A single word component for the name is selected and modified as defined in the
        NameComponent attributes.

        Errors encountered during name selection are documented in the info attribute.

        Args:
            definition_component (NameComponent): The definition component
            name_component_list (List[NameComponentsListModel]): The name component list

        Returns:
            NameComponentModel: The selected name component.
        """
        name_component = NameComponentModel()

        # There might not be any possible options.
        # If the word is optional, return an empty string and keep going, else, abort.
        if not name_component_list:
            if definition_component.is_optional:
                name_component.name_value = ""
                return name_component
            else:
                name_component.info = "Mandatory name component does not exist"
                return name_component

        # recording what we're doing for error logging
        action = "Source sorting"
        try:
            # sort the list by major/minor preference and select the top entry
            name_component_source = sorted(
                name_component_list, key=lambda x: x.preference_tuple
            )[0]
            # record the taxon id selected for this component
            action = "Value setting"
            name_component.taxon_name_id = name_component_source.taxon_name_id

            # remove any leading or trailing white space
            action = "Name value string"
            name_component.source_name_value = name_component_source.value
            name_value = name_component_source.value.strip()

            # handle the definition word manipulation settings
            if definition_component.name_is_abbreviated:
                action = "Name value abbreviation"
                name_value = name_value[0] + "."
            if definition_component.use_rank_abbreviation:
                action = "Rank abbreviation"
                # only a subset of kingdoms should have rank abbreviations defined
                # skip the rank abbreviation task if none exists in the query data
                if name_component_source.rank_abbreviation:
                    name_abbreviation = name_component_source.rank_abbreviation.strip()
                    rank_abbreviation = RankAbbreviationVals[name_abbreviation].strip()
                    name_value = rank_abbreviation + " " + name_value
            if definition_component.has_parentheses:
                action = "Parentheses"
                name_value = "(" + name_value + ")"
            name_component.name_value = name_value + " "

        except Exception as e:
            # It's unlikely anything could happen, but this is the only place we
            # manipulate data that came from the query so this is a catch-all.
            name_component.info = (
                f"Unexpected Error [{e}] encountered with component [{action}]"
            )

        return name_component
