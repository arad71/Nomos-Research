"""
These unit tests assure that the infrageneric name generating class logic functions
as designed, and that the infrageneric name definitions are correctly structured.

These tests uses a mock database query result object in place of setting up a complex
hierarchy result in the test database. The mock result was initially created by making
a partial hierarchy in the real database and recording the query result. Additional
rows were added to the column to account for possible hierarchy ranks that have not
been implemented at the time of task development.
"""

from typing import List

import pytest

from app.db.taxon_name.infrageneric_name_definitions.infrageneric_name_format_definitions import (
    all_name_combinations,
)
from app.db.taxon_name.infrageneric_names import (
    InfraGenericNameModel,
    InfraGenericNames,
)
from app.db.taxon_name.schema import TaxonNameRow
from app.tests.infrageneric_name_test_data import (
    name_set_full_hierarchy_162767,
    name_set_higher_taxa_uninomial_16441,
    name_set_infragenus_uninomial_162764,
    name_set_invalid_minimum_lowest_hierarchy_162767,
    name_set_minimum_highest_hierarchy_162763,
    name_set_minimum_lowest_hierarchy_162767,
    name_set_mixed_medium_hierarchy_162765,
    query_set_full_hierarchy_162767,
    query_set_higher_taxa_uninomial_16441,
    query_set_infragenus_uninomial_162764,
    query_set_invalid_minimum_lowest_hierarchy_162767,
    query_set_minimum_highest_hierarchy_162763,
    query_set_minimum_lowest_hierarchy_162767,
    query_set_mixed_medium_hierarchy_162765,
)

# ensure that every name format used by the system is represented in the tests
NUMBER_OF_DEFINED_NAME_FORMATS = len(all_name_combinations)

# sets of mock test data input and expected results for pytest parameterization
test_data = [
    (162767, query_set_full_hierarchy_162767, name_set_full_hierarchy_162767),
    (
        162767,
        query_set_minimum_lowest_hierarchy_162767,
        name_set_minimum_lowest_hierarchy_162767,
    ),
    (
        162763,
        query_set_minimum_highest_hierarchy_162763,
        name_set_minimum_highest_hierarchy_162763,
    ),
    (
        162765,
        query_set_mixed_medium_hierarchy_162765,
        name_set_mixed_medium_hierarchy_162765,
    ),
    (
        162767,
        query_set_invalid_minimum_lowest_hierarchy_162767,
        name_set_invalid_minimum_lowest_hierarchy_162767,
    ),
    (
        16441,
        query_set_higher_taxa_uninomial_16441,
        name_set_higher_taxa_uninomial_16441,
    ),
    (
        162764,
        query_set_infragenus_uninomial_162764,
        name_set_infragenus_uninomial_162764,
    ),
]


def check_results(
    expected_results: List[dict], generated_results: List[InfraGenericNameModel]
):
    for expected in expected_results:
        target_result = next(
            (
                name_result
                for name_result in generated_results
                if name_result.name_version == expected["name_version"]
            ),
            None,
        )
        assert target_result.formatted_name == expected["formatted_name"], (
            f"Name generation failed: Expected [{expected['formatted_name']}], "
            f"Generated [{target_result.formatted_name}], "
            f"Name version [{target_result.name_version}]."
        )


@pytest.mark.parametrize("mock_query_parameter, mock_query_data, expected", test_data)
def test_infrageneric_name_formats(
    mock_query_parameter: int, mock_query_data: List[TaxonNameRow], expected: List[dict]
):
    assert NUMBER_OF_DEFINED_NAME_FORMATS == len(expected), (
        f"{NUMBER_OF_DEFINED_NAME_FORMATS} name formats defined in the project, "
        f"{len(expected)} name formats defined in the test set. "
        "All name formats must be tested. "
    )

    helper = InfraGenericNames()
    output_names = helper.generate_names(mock_query_parameter, mock_query_data)
    assert len(output_names) == NUMBER_OF_DEFINED_NAME_FORMATS, (
        f"Expected {NUMBER_OF_DEFINED_NAME_FORMATS} results, "
        f"{len(output_names)} generated.\nExpected results list[{expected}].\n"
        f"Generated results list [{output_names}].\n "
    )

    check_results(expected, output_names)


def test_infrageneric_name_format_ids():
    all_ids = set([definition["id"] for definition in all_name_combinations])
    assert (
        len(all_ids) == NUMBER_OF_DEFINED_NAME_FORMATS
    ), "All name definitions must have a unique ID."
