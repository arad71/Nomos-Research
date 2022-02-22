from enum import Enum


class CrossReferenceType(str, Enum):
    ogv = "ogv"
    exc = "exc"
    mis = "mis"
    tsy = "tsy"
    nsy = "nsy"
    con = "con"
    forma = "forma"
    err = "err"
    isy = "isy"


class Active(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."
