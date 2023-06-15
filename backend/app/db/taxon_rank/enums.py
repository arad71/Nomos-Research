from enum import Enum


class RankAbbreviation(str, Enum):
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
}
