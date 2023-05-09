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


CheckList = List[ChecklistName]
