from pprint import pprint

from deepdiff import DeepDiff


def assert_list_dict_equal_ignoring(
    expected: list[dict], actual: list[dict], ignore_properties: list[str]
):
    """
    Asserts that two lists of dictionaries are equal after ignoring specified properties within the dictionaries.

    Args:
        expected (list[dict]): The first list of dictionaries to compare.
        actual (list[dict]): The second list of dictionaries to compare.
        ignore_properties (list[str]): A list of properties to ignore within the dictionaries.

    Raises:
        AssertionError: If the modified lists are not equal.
    """
    modified_expected = [
        {key: value for key, value in d.items() if key not in ignore_properties}
        for d in expected
    ]
    modified_actual = [
        {key: value for key, value in d.items() if key not in ignore_properties}
        for d in actual
    ]
    try:
        assert modified_expected == modified_actual
    except AssertionError:
        diff = DeepDiff(modified_expected, modified_actual)
        pprint(diff)
        raise


def assert_dict_equal_ignoring(
    expected: dict, actual: dict, ignore_properties: list[str]
):
    """
    Asserts that two dictionaries are equal after ignoring specified properties.

    Args:
        expected (dict): The first dictionary to compare.
        actual (dict): The second dictionary to compare.
        ignore_properties (list[str]): A list of properties to ignore.

    Raises:
        AssertionError: If the modified dictionaries are not equal.
    """
    modified_expected = {
        key: value for key, value in expected.items() if key not in ignore_properties
    }
    modified_actual = {
        key: value for key, value in actual.items() if key not in ignore_properties
    }

    assert modified_expected == modified_actual
