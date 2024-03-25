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


class MappingType(Enum):
    vanilla = "Vanilla"
    curation_data_extract = "Curation Data Extract"

class ConsCodeSource(Enum):
    State = "State"
    Federal = "Federal"
    Global = "Global"
