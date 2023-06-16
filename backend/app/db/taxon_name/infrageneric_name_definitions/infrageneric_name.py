from pydantic import BaseModel
from typing import List


class SourceField(BaseModel):
    label: str
    preference: int


class Source(BaseModel):
    hierarchy_rank: str
    preference: int
    field: List[SourceField]


class StaticString(BaseModel):
    is_static: bool
    value: str


class NameComponent(BaseModel):
    word_order_placement: int
    is_optional: bool
    static_string: StaticString
    use_rank_abbreviation: bool
    name_is_abbreviated: bool
    has_parentheses: bool
    source: List[Source]


class NameFormat(BaseModel):
    name_version: str
    example: str
    name_components: List[NameComponent]


class SubGeneraNameDefinitions(BaseModel):
    definitions_list: List[NameFormat]
