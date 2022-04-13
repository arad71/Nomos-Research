from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Response
from sqlalchemy import func, or_, select
from sqlalchemy.orm import aliased

from app.core.auth import authorize
from app.db.cross_reference.model import CrossReference
from app.db.kingdom.model import Kingdom
from app.db.session import get_db
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.model import TaxonRank

checklist_router = r = APIRouter(prefix="/checklist")


@r.get(
    "/curation",
    dependencies=[
        authorize(),
    ],
)
async def curation_checklist(
    response: Response,
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    current: Optional[bool] = None,
    anyUpdated: Optional[datetime] = None,
    updated: Optional[datetime] = None,
    crossReferenceUpdated: Optional[datetime] = None,
    acceptedNameUpdated: Optional[datetime] = None,
    db=Depends(get_db),
):
    original_name = aliased(TaxonName)
    accepted_name = aliased(TaxonName)
    kingdom = aliased(Kingdom)
    statement = (
        select(
            kingdom.kingdom_name.label("nomenclaturalCode"),
            original_name.scientific_name.label("scientificName"),
            original_name.author.label("scientificNameAuthorship"),
            original_name.is_current.label("isCurrent"),
            TaxonRank.rank_name.label("taxonRank"),
            original_name.validated,
            original_name.created_on.label("created"),
            original_name.updated_on.label("updated"),
            original_name.taxon_name_id.label("scientificNameId"),
            CrossReference.cross_reference_type.label("crossReferenceType"),
            CrossReference.cross_reference_id.label("crossReferenceId"),
            CrossReference.created_on.label("cross_reference_created_on").label(
                "crossReferenceCreated"
            ),
            CrossReference.updated_on.label("cross_reference_updated_on").label(
                "crossReferenceUpdated"
            ),
            CrossReference.active.label("crossReferenceActive"),
            accepted_name.scientific_name.label("acceptedNameUsage"),
            accepted_name.author.label("acceptedNameAuthor"),
            accepted_name.is_current.label("acceptedNameCurrent"),
            accepted_name.validated.label("acceptedNameValidated"),
            accepted_name.created_on.label("acceptedNameCreated"),
            accepted_name.updated_on.label("acceptedNameUpdated"),
            accepted_name.taxon_name_id.label("acceptedNameUsageId"),
        )
        .join(
            CrossReference,
            onclause=CrossReference.old_name_id == original_name.taxon_name_id,
            isouter=True,
        )
        .join(
            accepted_name,
            onclause=CrossReference.new_name_id == accepted_name.taxon_name_id,
            isouter=True,
        )
        .join(kingdom, onclause=kingdom.kingdom_id == original_name.kingdom_id)
        .join(TaxonRank, onclause=TaxonRank.taxon_rank_id == original_name.rank_id)
        .filter(original_name.validated)
        .filter(
            or_(accepted_name.validated, accepted_name.validated == None)  # noqa: E711
        )
        .filter(
            or_(
                accepted_name.is_current, accepted_name.is_current == None  # noqa: E711
            )
        )
        .filter(or_(CrossReference.active, CrossReference.active == None))  # noqa: E711
    )
    if updated:
        statement = statement.filter(original_name.updated_on >= updated)
    if crossReferenceUpdated:
        statement = statement.filter(CrossReference.updated_on >= updated)
    if acceptedNameUpdated:
        statement = statement.filter(accepted_name.updated_on >= updated)
    if anyUpdated:
        statement = statement.filter(
            or_(
                original_name.updated_on >= anyUpdated,
                accepted_name.updated_on >= anyUpdated,
                CrossReference.updated_on >= anyUpdated,
            )
        )
    if current is not None:
        statement = statement.filter(original_name.is_current == current)
    count_query = statement.with_only_columns(func.count(original_name.taxon_name_id))
    count = db.execute(count_query).scalar_one()
    response.headers["Content-Range"] = f"{offset}-{limit - 1 + offset}/{count}"
    statement = statement.limit(limit).offset(offset)
    result = db.execute(statement)
    return result.all()
