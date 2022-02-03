import typing as t
from datetime import datetime

from pydantic import BaseModel


class UserBase(BaseModel):
    email: str
    is_active: bool = True
    is_superuser: bool = False
    first_name: str = None
    last_name: str = None


class UserOut(UserBase):
    pass


class UserCreate(UserBase):
    password: str

    class Config:
        orm_mode = True


class UserEdit(UserBase):
    password: t.Optional[str] = None

    class Config:
        orm_mode = True


class User(UserBase):
    user_id: int

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str = None
    permissions: str = "user"


class TableBase(BaseModel):
    updated_by: int
    updated_on: datetime
    created_by: int
    created_on: datetime

    class Config:
        orm_mode = True


# Author
class AuthorBase(TableBase):
    author: str
    surname: str
    first_names: str
    initials: str
    orc_id: int


class AuthorCreate(AuthorBase):
    pass


class AuthorEdit(AuthorBase):
    pass


class Author(AuthorBase):
    author_id: int

    class Config:
        orm_mode = True


# ClassificationSystem
class ClassificationSystemBase(TableBase):
    class_desc: str
    class_type: str
    preferred: str
    sort_order: int


class ClassificationSystemCreate(ClassificationSystemBase):
    pass


class ClassificationSystemEdit(ClassificationSystemBase):
    pass


class ClassificationSystem(ClassificationSystemBase):
    classification_system_id: str

    class Config:
        orm_mode = True


# InformalGroup
class InformalGroupBase(TableBase):
    class_id: str
    name_id: int


class InformalGroupCreate(InformalGroupBase):
    pass


class InformalGroupEdit(InformalGroupBase):
    pass


class InformalGroup(InformalGroupBase):
    informal_group_id: str

    class Config:
        orm_mode = True

# Kingdom
class KingdomBase(TableBase):
    kingdom_name: str
    kingdom_desc: str


class KingdomCreate(KingdomBase):
    pass


class KingdomEdit(KingdomBase):
    pass


class Kingdom(KingdomBase):
    kingdom_id: int

    class Config:
        orm_mode = True

# TaxonName
class TaxonNameBase(TableBase):
    kingdom_id: int
    rank_id: int
    rank_name: str
    uninomial: str
    kingdom: str
    phylum: str
    # class is a reserved word, will this workaround be enough?
    taxon_class: str
    order: str
    family: str
    genus: str
    subgenus: str
    scientific_name: str
    species: str
    subspecies: str
    taxon_rank: str
    specific_epithet: str
    infraspecific_epithet: str
    publication_id: int
    volume_information: str
    publication_year: int
    is_current: str
    origin: str
    informal: str
    form_desc_yr: int
    form_desc_mn: int
    form_desc_dy: int
    comments: str
    contributed_by: str
    contributed_on: datetime
    validated: str
    source: str
    external_id: str
    family_code: str
    author: str
    vernacular: str
    editor: str
    naturalised_status: str
    naturalised_certainty: str
    is_eradicated: str
    naturalised_comments: str
    linear_sequence: int
    family_nid: int
    all_vernaculars: str
    notes: str
    reference: str
    authorised_by: str
    authorised_on: datetime


class TaxonNameCreate(TaxonNameBase):
    pass


class TaxonNameEdit(TaxonNameBase):
    pass


class TaxonName(TaxonNameBase):
    name_id: int

    class Config:
        orm_mode = True


# Hierarchy
class HierarchyBase(TableBase):
    name_id: int
    classification_id: str
    parent_nid: int
    pass


class HierarchyCreate(HierarchyBase):
    pass


class HierarchyEdit(HierarchyBase):
    pass


class Hierarchy(HierarchyBase):
    hierarchy_id: int

    class Config:
        orm_mode = True


# Publication
class PublicationBase(TableBase):
    bad_publication: str
    publication: str
    publication_name: str

    pass


class PublicationCreate(PublicationBase):
    pass


class PublicationEdit(PublicationBase):
    pass


class Publication(PublicationBase):
    publication_id: int

    class Config:
        orm_mode = True


# TaxonRank
class TaxonRankBase(TableBase):
    rank_id: int
    rank_name: str
    rank_abbrev: str
    direct_parent_rank_id: int
    required_parent_rank_id: int


class TaxonRankCreate(TaxonRankBase):
    pass


class TaxonRankEdit(TaxonRankBase):
    pass


class TaxonRank(TaxonRankBase):
    kingdom_id: int

    class Config:
        orm_mode = True


# Vernacular
class VernacularBase(TableBase):
    vernacular: str
    language: str
    lang_pref: str
    preferred: str
    source: str
    enabled: str
    sort_order: int


class VernacularCreate(VernacularBase):
    pass


class VernacularEdit(VernacularBase):
    pass

class Vernacular(VernacularBase):
    name_id: int

    class Config:
        orm_mode = True


# CrossReference
class CrossReferenceBase(TableBase):
    old_name_id: int
    new_name_id: int
    xref_type: str
    active: str
    authorised_by: str
    authorised_yr: int
    authorised_mn: int
    authorised_dy: int
    comments: str
    notes: str


class CrossReferenceCreate(CrossReferenceBase):
    pass


class CrossReferenceEdit(CrossReferenceBase):
    pass


class CrossReference(CrossReferenceBase):
    xref_id: int

    class Config:
        orm_mode = True
