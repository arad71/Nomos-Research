from enum import Enum


class AuthorType(str, Enum):
    basionym = "basionym"
    current = "current"
    editor = "editor"
