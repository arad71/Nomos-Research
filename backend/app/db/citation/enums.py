from enum import Enum


class AuthorType(str, Enum):
    basionym = "basionym"
    current = "current"
    editor = "editor"
    ex_basionym = "ex_basionym"
    ex_current = "ex_current"
