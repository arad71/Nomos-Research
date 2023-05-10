from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChecklistName(BaseModel):
    nomenclaturalCode: str
    scientificName: str
    scientificNameAuthorship: Optional[str]
    canonicalName: str
    canonicalNameWithoutRank: str
    uninomial: Optional[str]
    specificEpithet: Optional[str]
    infraspecificEpithet: Optional[str]
    nameRepresentations: Optional[List[str]]
    establishmentMeans: Optional[str]
    vernacularName: Optional[List[str]]
    informalGroups: Optional[List[str]]
    isCurrent: bool
    taxonRank: str
    validated: bool
    created: datetime
    updated: datetime
    scientificNameId: int
    crossReferenceType: Optional[str]
    crossReferenceId: Optional[str]
    crossReferenceCreated: Optional[datetime]
    crossReferenceUpdated: Optional[datetime]
    acceptedNameUsage: Optional[str]
    acceptedNameAuthor: Optional[str]
    acceptedNameCurrent: Optional[bool]
    acceptedNameValidated: Optional[bool]
    acceptedNameCreated: Optional[datetime]
    acceptedNameUpdated: Optional[datetime]
    acceptedNameUsageId: Optional[int]
    relatedNamesCount: Optional[int]
    kingdom: Optional[str]
    division: Optional[str]
    phylum: Optional[str]
    class_: Optional[str] = Field(None, alias="class")
    subclass: Optional[str]
    order: Optional[str]
    suborder: Optional[str]
    family: Optional[str]
    subfamily: Optional[str]
    genus: Optional[str]
    subgenus: Optional[str]
    section: Optional[str]
    series: Optional[str]
    species: Optional[str]
    variety: Optional[str]
    form: Optional[str]

    class Config:
        schema_extra = {
            "example": {
                "nomenclaturalCode": "Animalia",
                "scientificName": "Dero (Aulophorus) furcatus furcatus (Müller, 1774)",
                "scientificNameAuthorship": "(Müller, 1774)",
                "canonicalName": "Dero (Aulophorus) furcatus furcatus",
                "canonicalNameWithoutRank": "Dero (Aulophorus) furcatus furcatus",
                "uninomial": "Dero",
                "specificEpithet": "furcatus",
                "infraspecificEpithet": "furcatus",
                "nameRepresentations": [
                    "Dero (Aulophorus) furcatus subsp. furcatus (Müller, 1774)",
                    "Dero (Aulophorus) furcatus furcatus (Müller, 1774)",
                    "Dero furcatus furcatus (Müller, 1774)",
                    "Dero (Aulophorus) furcatus subsp. furcatus",
                    "Dero (Aulophorus) furcatus furcatus",
                    "Dero furcatus furcatus",
                ],
                "isCurrent": True,
                "taxonRank": "Subspecies",
                "validated": True,
                "created": "2022-07-22T07:10:09.276837+00:00",
                "updated": "2022-12-13T06:31:09.938014+00:00",
                "scientificNameId": 99999999,
                "kingdom": "Animalia",
                "phylum": "Annelida",
                "class": "Oligochaeta",
                "subclass": "Tubificata",
                "order": "Tubificida",
                "suborder": "Tubificina",
                "family": "Naididae",
                "subfamily": "Naidinae",
                "genus": "Dero",
                "subgenus": "Aulophorus",
                "species": "furcatus",
                "subspecies": "furcatus",
            }
        }


CheckList = List[ChecklistName]
