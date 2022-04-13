from enum import Enum


class NaturalisedStatus(str, Enum):
    a = "a"
    n = "n"
    m = "m"
    u = "u"


class PublicationStatus(str, Enum):
    published = "Published"
    manuscript_name = "Manuscript"
    phrase_name = "Phrase Name"
