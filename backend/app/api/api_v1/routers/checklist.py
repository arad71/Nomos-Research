from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, Response
from fastapi_key_auth import AuthorizerDependency
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, aliased

from app.db.checklist.schema import CheckList
from app.db.classification_system.model import ClassificationSystem
from app.db.cross_reference.model import CrossReference
from app.db.hierarchy.model import Hierarchy
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
    response_model=CheckList,
    # response_model_exclude_none=True,
    dependencies=[
        Depends(authorizer),
    ],
)
async def curation_checklist(
    response: Response,
    validated: Optional[bool] = None,
    limit: Optional[int] = Query(default=10, ge=0, le=1000),
    offset: Optional[int] = 0,
    current: Optional[bool] = None,
    anyUpdated: Optional[datetime] = None,
    updated: Optional[datetime] = None,
    crossReferenceUpdated: Optional[datetime] = None,
    acceptedNameUpdated: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    """Get a list of taxonomic names in the database, with optional filters.

    This endpoint retrieves a list of taxonomic names in the database, with various
     optional filters available. By default, the endpoint will return the first 10
     results. You can control the number of results returned using the `limit`
      parameter, and the starting point using the `offset` parameter.

    You can filter the results based on a number of criteria, such as whether the
     taxonomic name has been validated or is current. You can also filter the results by
      the date when the taxonomic name or related data was last updated.

    To use this endpoint, you must provide an API key in the request headers. The key
    should be stored in an environment variable named `API_KEY_XXX`, where `XXX` is a
    unique identifier for your API key.

    Parameters:
    - response (fastapi.Response): The response object.
    - validated (bool, optional): Whether to return only validated taxonomic names.
     Defaults to `None`.
    - limit (int, optional): The maximum number of results to return. Defaults to `10`.
    - offset (int, optional): The starting point for results. Defaults to `0`.
    - current (bool, optional): Whether to return only current taxonomic names.
    Defaults to `None`.
    - anyUpdated (datetime, optional): Filters the results to return only taxonomic
    names or related data updated after the specified date.
    - updated (datetime, optional): Filters the results to return only taxonomic names
    updated after the specified date.
    - crossReferenceUpdated (datetime, optional): Filters the results to return only
     taxonomic names that have cross-references updated after the specified date.
    - acceptedNameUpdated (datetime, optional): Filters the results to return only
     taxonomic names that have an accepted name updated after the specified date.
    - db (sqlalchemy.orm.Session, optional): The database session. Defaults to
    `Depends(get_db)`.

    Returns:
    - CheckList: The list of taxonomic names that match the specified criteria.

    Raises:
    - HTTPException: If the API key is invalid or missing.

    Example:
    ```python
    import requests

    response = requests.get(
        "http://localhost:8000/checklist/curation",
        headers={"Authorization": "Bearer YOUR_API_KEY_HERE"},
        params={"limit": 20, "validated": True},
    )

    print(response.json())
    """
    original_name = aliased(TaxonName)
    accepted_name = aliased(TaxonName)
    kingdom = aliased(Kingdom)

    cross_reference_counts = await cross_reference_counts_subquery()
    vernacular = await vernacular_subquery()
    informal_group = await informal_group_subquery()

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
    statement = await add_higher_ranks_to_statement(original_name, statement)

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


async def add_higher_ranks_to_statement(
    original_name: aliased, statement: select
) -> select:
    """
    Add higher taxonomic ranks to a SQL select statement.

    :param original_name: An alias representing the original taxonomic rank.
    :type original_name: aliased
    :param statement: A SQL select statement.
    :type statement: select
    :return: The SQL select statement with higher taxonomic ranks added.
    :rtype: select
    """
    # List of higher taxonomic ranks
    higher_ranks = [
        "division",
        "phylum",
        "class",
        "subclass",
        "order",
        "suborder",
        "family",
        "subfamily",
        "genus",
        "subgenus",
        "species",
        "subspecies",
        "variety",
        "form",
    ]
    # Loop through higher taxonomic ranks and add subqueries to the SQL statement
    for higher_rank in higher_ranks:
        statement = await add_higher_rank_subquery(
            statement, original_name, higher_rank
        )
    # Return the modified SQL select statement
    return statement


async def add_higher_rank_subquery(
    statement: select, original_name: TaxonName, higher_rank: str
) -> select:
    """
    Adds a subquery to the given `statement` that joins the `Hierarchy`, `TaxonName`,
    and `TaxonRank` tables to return the canonical name and ID of the given
    `higher_rank` for each taxon in the hierarchy containing `original_name`. The
     subquery is added to the `statement` using an outer join.

    :param statement: The SQLAlchemy `select` statement to add the subquery to.
    :type statement: select
    :param original_name: The original taxon name to find the hierarchy containing it.
    :type original_name: TaxonName
    :param higher_rank: The higher rank to find the canonical name and ID for.
    :type higher_rank: str
    :return: The modified SQLAlchemy `select` statement.
    :rtype: select"""
    hierarchy = aliased(Hierarchy)
    ancestor = aliased(Hierarchy)
    ancestor_name = aliased(TaxonName)
    taxon_rank = aliased(TaxonRank)
    higher_rank_id = higher_rank + "_id"
    subquery = (
        select(
            hierarchy.taxon_name_id,
            ancestor_name.canonical_name.label(higher_rank),
            ancestor.taxon_name_id.label(higher_rank_id),
        )
        .join(
            ancestor,
            ancestor.path.ancestor_of(hierarchy.path),
        )
        .join(
            ancestor_name,
            ancestor.taxon_name_id == ancestor_name.taxon_name_id,
        )
        .join(
            taxon_rank,
            and_(
                ancestor_name.rank_id == taxon_rank.taxon_rank_id,
                taxon_rank.rank_name == higher_rank.capitalize(),
            ),
        )
        .filter(
            and_(
                hierarchy.deleted == False,  # noqa: E712 SQLAlchemy requires == comp.
                ancestor.deleted == False,  # noqa: E712
                ancestor_name.deleted == False,  # noqa: E712
                taxon_rank.deleted == False,  # noqa: E712
            )
        )
        .subquery(higher_rank)
    )
    statement = statement.outerjoin(
        subquery,
        onclause=subquery.c.taxon_name_id == original_name.taxon_name_id,
    ).add_columns(
        subquery.c[higher_rank],
        subquery.c[higher_rank_id].label(higher_rank + "Id"),
    )
    return statement


async def cross_reference_counts_subquery() -> select:
    """
    Create a subquery that returns the count of cross-references for each old name ID.

    :return: A SQLAlchemy select statement representing the subquery."""
    cross_reference_counts = (
        select(
            CrossReference.old_name_id.label("old_name_id"),
            func.count(CrossReference.new_name_id).label("count"),
        )
        .group_by(CrossReference.old_name_id)
        .filter(
            CrossReference.deleted
            == False,  # noqa: E712 SQLAlchemy requires == for boolean comparison
        )
        .subquery()
    )
    return cross_reference_counts


async def vernacular_subquery() -> select:
    """
    Create a subquery to get a list of vernacular names for each taxon name.

    :return: A SQAlchemy select statement representing the subquery.
    :rtype: select"""
    vernacular = (
        select(
            Vernacular.taxon_name_id,
            func.array_agg(Vernacular.vernacular_name).label("vernacular_names"),
        )
        .group_by(Vernacular.taxon_name_id)
        .filter(
            and_(
                Vernacular.deleted == False,  # noqa: E712
                Vernacular.preferred == True,  # noqa: E712
            )
        )
        .subquery()
    )
    return vernacular


async def informal_group_subquery():
    """
    Returns a subquery that joins the `InformalGroup` and `ClassificationSystem` tables
    to aggregate the informal groups of a given taxon name as an array. The resulting
    subquery can be used to join with a SQLAlchemy `select` statement.

    :return: A SQLAlchemy `select` statement.
    :rtype: :class:`sqlalchemy.sql.selectable.Select`"""
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
            )
        )
        .subquery()
    )
    return informal_group
