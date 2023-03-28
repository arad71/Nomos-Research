from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Response
from fastapi_key_auth import AuthorizerDependency
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, aliased

from app.db.classification_system.model import ClassificationSystem
from app.db.cross_reference.model import CrossReference
from app.db.informal_group.model import InformalGroup
from app.db.kingdom.model import Kingdom
from app.db.session import get_db
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.model import TaxonRank
from app.db.vernacular.model import Vernacular

checklist_router = r = APIRouter(prefix="/checklist")
authorizer = AuthorizerDependency(key_pattern="API_KEY_")


@r.get(
    "/curation",
    dependencies=[
        Depends(authorizer),
    ],
)
async def curation_checklist(
    response: Response,
    validated: Optional[bool] = None,
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    current: Optional[bool] = None,
    anyUpdated: Optional[datetime] = None,
    updated: Optional[datetime] = None,
    crossReferenceUpdated: Optional[datetime] = None,
    acceptedNameUpdated: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    original_name = aliased(TaxonName)
    accepted_name = aliased(TaxonName)
    kingdom = aliased(Kingdom)

    cross_reference_counts = (
        select(
            CrossReference.old_name_id.label("old_name_id"),
            func.count(CrossReference.new_name_id).label("count"),
        )
        .group_by(CrossReference.old_name_id)
        .filter(
            CrossReference.deleted == False,  # noqa: E712
        )
        .subquery()
    )
    vernacular = (
        select(
            Vernacular.taxon_name_id,
            func.array_agg(Vernacular.vernacular_name).label("vernacular_names"),
        )
        .group_by(Vernacular.taxon_name_id)
        .filter(
            and_(Vernacular.deleted == False, Vernacular.preferred == True)  # noqa:
            # E712
        )
        .subquery()
    )
    informal_group = (
        select(
            InformalGroup.taxon_name_id,
            func.array_agg(ClassificationSystem.class_desc).label("informal_groups"),
        )
        .join(
            ClassificationSystem,
            onclause=InformalGroup.classification_system_id
            == ClassificationSystem.classification_system_id,
        )
        .group_by(InformalGroup.taxon_name_id)
        .filter(
            and_(
                InformalGroup.deleted == False,  # noqa: E712
                ClassificationSystem.deleted == False,  # noqa: E712
            )  #
        )
        .subquery()
    )
    statement = (
        select(
            kingdom.kingdom_name.label("nomenclaturalCode"),
            original_name.scientific_name.label("scientificName"),
            original_name.author.label("scientificNameAuthorship"),
            original_name.canonical_name.label("canonicalName"),
            original_name.canonical_name_without_rank.label("canonicalNameWithoutRank"),
            original_name.naturalised_status.label("establishmentMeans"),
            vernacular.c.vernacular_names.label("vernacularNames"),
            informal_group.c.informal_groups.label("informalGroups"),
            original_name.is_current.label("isCurrent"),
            TaxonRank.rank_name.label("taxonRank"),
            original_name.validated.label("validated"),
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
            accepted_name.scientific_name.label("acceptedNameUsage"),
            accepted_name.author.label("acceptedNameAuthor"),
            accepted_name.is_current.label("acceptedNameCurrent"),
            accepted_name.validated.label("acceptedNameValidated"),
            accepted_name.created_on.label("acceptedNameCreated"),
            accepted_name.updated_on.label("acceptedNameUpdated"),
            accepted_name.taxon_name_id.label("acceptedNameUsageId"),
            cross_reference_counts.c.count.label("relatedNamesCount"),
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
        .outerjoin(
            cross_reference_counts,
            onclause=cross_reference_counts.c.old_name_id
            == original_name.taxon_name_id,
        )
        .outerjoin(
            vernacular,
            onclause=vernacular.c.taxon_name_id == original_name.taxon_name_id,
        )
        .outerjoin(
            informal_group,
            onclause=informal_group.c.taxon_name_id == original_name.taxon_name_id,
        )
        .join(kingdom, onclause=kingdom.kingdom_id == original_name.kingdom_id)
        .join(TaxonRank, onclause=TaxonRank.taxon_rank_id == original_name.rank_id)
        .filter(
            or_(
                accepted_name.is_current, accepted_name.is_current == None  # noqa: E711
            )
        )
        .filter(
            or_(
                accepted_name.deleted == False,  # noqa: E712
                accepted_name.deleted == None,  # noqa: E711
            )
        )
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
    statement = statement.filter(original_name.deleted == False)  # noqa
    if validated is not None:
        statement = statement.filter(original_name.validated == validated)
    count_query = statement.with_only_columns(func.count(original_name.taxon_name_id))
    count = db.execute(count_query).scalar_one()
    response.headers["Content-Range"] = f"{offset}-{limit - 1 + offset}/{count}"
    statement = statement.limit(limit).offset(offset)
    result = db.execute(statement)
    return result.all()
