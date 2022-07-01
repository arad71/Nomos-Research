from enum import Enum


class NaturalisedStatus(str, Enum):
    alien = "alien"
    native = "native"
    mixed = "mixed"
    uncertain = "uncertain"


class PublicationStatus(str, Enum):
    published = "published"
    manuscript_name = "manuscript_name"
    phrase_name = "phrase_name"
