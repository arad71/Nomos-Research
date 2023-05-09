from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChecklistName(BaseModel):
    nomenclaturalCode: str
    scientificName: str
    scientificNameAuthorship: Optional[str]
    canonicalName: str
    canonicalNameWithoutRank: str
    establishmentMeans: Optional[str]
    vernacularNames: Optional[List[str]]
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
    kingdomId: Optional[str]
    division: Optional[str]
    divisionId: Optional[int]
    phylum: Optional[str]
    phylumId: Optional[int]
    class_: Optional[str] = Field(None, alias="class")
    classId: Optional[int]
    subclass: Optional[str]
    subclassId: Optional[int]
    order: Optional[str]
    orderId: Optional[int]
    suborder: Optional[str]
    suborderId: Optional[int]
    family: Optional[str]
    familyId: Optional[int]
    subfamily: Optional[str]
    subfamilyId: Optional[int]
    genus: Optional[str]
    genusId: Optional[int]
    subgenus: Optional[str]
    subgenusId: Optional[int]
    species: Optional[str]
    speciesId: Optional[int]


CheckList = List[ChecklistName]
