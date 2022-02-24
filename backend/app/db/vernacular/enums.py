from enum import Enum


class Language(str, Enum):
    english = "english"
    indigenous = "indigenous"


class LangPref(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class Preferred(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class Enabled(str, Enum):
    y = "y"
    n = "n"
