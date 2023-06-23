from enum import Enum


class RankAbbreviation(str, Enum):
    """
    Rank abbreviations are not listed in hierarchical order.
    Rank abbreviation enums are used for restricting entries on the rank_abbrev column.
    """
    subsp = "subsp"
    nothovar = "nothovar"
    cv = "cv"
    var = "var"
    subvar = "subvar"
    forma = "forma"
    subf = "subf"
    subg = "subg"
    sect = "sect"
    subsect = "subsect"
    ser = "ser"
    subser = "subser"
    supersp = "supersp"
    subforma = "subforma"


RankAbbreviationVals = {
    "subsp": "subsp.",
    "nothovar": "nothovar.",
    "cv": "cv.",
    "var": "var.",
    "subvar": "subvar.",
    "forma": "forma",
    "subf": "subf.",
    "subg": "subg.",
    "sect": "sect.",
    "subsect": "subsect.",
    "ser": "ser.",
    "subser": "subser.",
    "supersp": "supersp.",
    "subforma": "subforma",
}
