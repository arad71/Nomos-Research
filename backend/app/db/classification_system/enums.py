from enum import Enum


class ClassificationType(str, Enum):
    informal = "informal"
    hierarchical = "hierarchical"


class ClassificationPreferred(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."
