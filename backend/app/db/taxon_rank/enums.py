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
    ser = "ser"
    subser = "subser"
    superser = "superser"
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
    "superser": "superser.",
    "subforma": "subforma",
}
