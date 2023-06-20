from black import List

from app.db.taxon_name.infrageneric_name_definitions.infrageneric_name_format_definitions import \
    all_name_combinations
from app.db.taxon_name.infrageneric_names import InfraGenericNames, \
    InfraGenericNameModel
from app.tests.infrageneric_name_test_data import full_hierarchy_set_162767, \
    minimum_set_lowest_hierarchy_162767, minimum_set_highest_hierarchy_162763, \
    mixed_set_medium_hierarchy_162765, minimum_set_invalid_lowest_162767, \
    expected_full_hierarchy_set_162767, expected_minimum_set_lowest_hierarchy_162767, \
    expected_minimum_set_highest_hierarchy_162763, \
    expected_mixed_set_medium_hierarchy_162765, \
    expected_minimum_set_invalid_lowest_162767

full_hierarchy_set_162767
minimum_set_lowest_hierarchy_162767
minimum_set_highest_hierarchy_162763
mixed_set_medium_hierarchy_162765
minimum_set_invalid_lowest_162767
expected_full_hierarchy_set_162767
expected_minimum_set_lowest_hierarchy_162767
expected_minimum_set_highest_hierarchy_162763
expected_mixed_set_medium_hierarchy_162765
expected_minimum_set_invalid_lowest_162767

"""
These unit tests assure that the infrageneric name generating class logic functions
as designed, and that the infrageneric name definitions are correctly structured.
"""

NUMBER_OF_DEFINED_NAME_FORMATS = len(all_name_combinations)


def check_results(expected_results: List[dict], generated_results: List[InfraGenericNameModel]):
    assert NUMBER_OF_DEFINED_NAME_FORMATS == len(expected_results)
    for expected in expected_results:
        target_result = next((name_result for name_result in generated_results if name_result.name_version == expected["name_version"]), None)
        assert target_result.formatted_name == expected["formatted_name"]



def test_infrageneric_name_formats():

    infrageneric_names_helper = InfraGenericNames()
    infrageneric_names = infrageneric_names_helper.generate_names(162763, minimum_set_highest_hierarchy_162763)
    check_results(expected_minimum_set_highest_hierarchy_162763, infrageneric_names)
    print(infrageneric_names)
    print("check")
    print(expected_minimum_set_highest_hierarchy_162763)
    assert 1 == 2
