from pydantic import BaseModel
from typing import List


class SourceField(BaseModel):
    """
    Represents a field in a source.

    This defines which columns are valid to select words from
    [uninomial, specific epithet, infraspecific_epithet], and which order to
    select from if multiple exist.

    See source definitions for examples.
    """
    label: str
    preference: int


class Source(BaseModel):
    """
    Represents a source.

    There will always be at least one source for each word in the name.
    Multiple sources are possible.
    This defines which taxonomic rank could be used for the word, and what order to
    select the source from if multiple exist.

    See source definitions for examples.
    """
    hierarchy_rank: str
    preference: int
    field: List[SourceField]


class StaticString(BaseModel):
    """
    Represents a static string.

    This segment is for defining name elements that will never change (if they exist).
    If set to true, this word will not have any consideration for the taxon query.
    """
    is_static: bool
    value: str


class NameComponent(BaseModel):
    """
    Represents a name component.

    This segment is for defining how to select and modify a word from the taxon query
    results.

    word_order_placement: what position in the name does this word occupy
    is_optional: If there is no valid selection available, this word will be skipped
    static_string: If defined, will be the defined static string. See class definition.
    use_rank_abbreviation: prepend with abbreviation: Name -> abbr. Name
    name_is_abbreviated: replace the word with the fist letter:  Name -> N.
    has_parentheses: surround with (): abbr. N. -> (abbr. N.)
    source: source used to select the word. See class definition.
    """
    word_order_placement: int
    is_optional: bool
    static_string: StaticString
    use_rank_abbreviation: bool
    name_is_abbreviated: bool
    has_parentheses: bool
    source: List[Source]


class NameFormat(BaseModel):
    """
    Represents a name format.

    name_version: The title of the name format
    example: example of the properly formatted name
    name_components: definitions of how to create the name.

    name_components is a list. One name_component must be defined for each individual
    element in the name. Ranks associated with a name element are part of that element
    and do not get their own component entry in the list.
    """
    name_version: str
    example: str
    name_components: List[NameComponent]


class SubGeneraNameDefinitions(BaseModel):
    """
    Represents sub-genera name definitions.

    The definitions are created as a list of json descriptions, one description per
    unique name. The json format was selected to make the name definitions
    (somewhat) easier for non-developers to create and modify.

    A strict pydantic model definition was implemented to ensure all name definitions
    are properly formatted before being accepted into the code base.
    Any additional fields added to a name definition must be applied to all names.
    """
    definitions_list: List[NameFormat]
