from enum import Enum


class NaturalisedStatus(str, Enum):
    a = "a"
    n = "n"
    m = "m"
    u = "u"


class PublicationStatus(str, Enum):
    published = "published"
    manuscript_name = "manuscript_name"
    phrase_name = "phrase_name"
