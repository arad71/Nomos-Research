from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChecklistName(BaseModel):
    nomenclaturalCode: str
    scientificName: str
    scientificNameAuthorship: Optional[str] = None
    canonicalName: str
    canonicalNameWithoutRank: str
    uninomial: Optional[str] = None
    specificEpithet: Optional[str] = None
    infraspecificEpithet: Optional[str] = None
    nameRepresentations: Optional[List[str]] = None
    establishmentMeans: Optional[str] = None
    review: bool
    reviewReason: Optional[str] = None
    vernacularName: Optional[List[str]] = None
    conscodeList: Optional[List[str]] = None
    informalGroups: Optional[List[str]] = None
    isCurrent: bool
    taxonRank: str
    validated: bool
    created: datetime
    updated: datetime
    scientificNameId: int
    crossReferenceType: Optional[str] = None
    crossReferenceId: Optional[str] = None
    crossReferenceCreated: Optional[datetime] = None
    crossReferenceUpdated: Optional[datetime] = None
    acceptedNameUsage: Optional[str] = None
    acceptedNameAuthor: Optional[str] = None
    acceptedNameCurrent: Optional[bool] = None
    acceptedNameValidated: Optional[bool] = None
    acceptedNameCreated: Optional[datetime] = None
    acceptedNameUpdated: Optional[datetime] = None
    acceptedNameUsageId: Optional[int] = None
    acceptedNameReview: Optional[bool] = None
    acceptedNameReviewReason: Optional[str] = None
    relatedNamesCount: Optional[int] = None
    kingdom: Optional[str] = None
    division: Optional[str] = None
    phylum: Optional[str] = None
    class_: Optional[str] = Field(default=None, alias="class")
    subclass: Optional[str] = None
    order: Optional[str] = None
    suborder: Optional[str] = None
    family: Optional[str] = None
    subfamily: Optional[str] = None
    genus: Optional[str] = None
    subgenus: Optional[str] = None
    section: Optional[str] = None
    series: Optional[str] = None
    species: Optional[str] = None
    subspecies: Optional[str] = None
    variety: Optional[str] = None
    form: Optional[str] = None

    # Pydantic v2: replace class Config with model_config
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "nomenclaturalCode": "Animalia",
                "scientificName": "Dero (Aulophorus) furcatus furcatus (Müller, 1774)",
                "scientificNameAuthorship": "(Müller, 1774)",
                "canonicalName": "Dero (Aulophorus) furcatus furcatus",
                "canonicalNameWithoutRank": "Dero (Aulophorus) furcatus furcatus",
                "uninomial": "Dero",
                "specificEpithet": "furcatus",
                "infraspecificEpithet": "furcatus",
                "review": False,
                "reviewReason": None,
                "conscodeList": None,
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
                "crossReferenceType": None,
                "acceptedNameUsage": None,
                "acceptedNameAuthor": None,
                "acceptedNameCurrent": None,
                "acceptedNameValidated": None,
                "acceptedNameReview": True,
                "acceptedNameReviewReason": "This taxon is subject to CITES controls",
                "relatedNamesCount": None,
                "kingdom": "Animalia",
                "division": None,
                "phylum": "Annelida",
                "class": "Oligochaeta",
                "subclass": None,
                "order": "Tubificida",
                "suborder": "Tubificina",
                "family": "Naididae",
                "subfamily": "Naidinae",
                "genus": "Dero",
                "subgenus": "Aulophorus",
                "section": None,
                "series": None,
                "species": "furcatus",
                "subspecies": "furcatus",
                "variety": None,
                "form": None,
            }
        }
    )


CheckList = List[ChecklistName]
