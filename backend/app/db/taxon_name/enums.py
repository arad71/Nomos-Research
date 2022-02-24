from enum import Enum


class IsCurrent(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class Validated(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class NaturalisedStatus(str, Enum):
    a = "a"
    n = "n"
    m = "m"
    u = "u"


class NaturalisedCertainty(str, Enum):
    y = "y"
    n = "n"
