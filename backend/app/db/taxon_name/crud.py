from __future__ import annotations

from typing import List, Optional

import loguru
import rich.progress
import sqlalchemy.orm as orm
from fastapi import HTTPException, status
from pydantic import parse_obj_as

import app.db.crud as crud
import app.db.taxon_name.schema as schema
from app.db.hierarchy.model import Hierarchy
from app.db.informal_group.model import InformalGroup
from app.db.taxon_name.calculated import calculate_formatted_scientific_name
from app.db.taxon_name.infrageneric_names import (
    InfraGenericNameModel,
    InfraGenericNames,
)
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User

CALCULATE_LOG = "/app/log/calculate.log"

INFRAGENUS_WITH_RANK = "Infragenus with rank"

CANONICAL = "Canonical"

CANONICAL_WITHOUT_RANK = "Canonical without rank"


class TaxonNameCrud(crud.Crud):
    """
    Class to perform CRUD operations on TaxonName model.
    """

    model = TaxonName
    id_key = "taxon_name_id"
    name = "Taxon Name"
    search_fields = [
        "scientific_name",
        "canonical_name",
        "canonical_name_without_rank",
        "author",
        "all_vernaculars",
        "cross_referenced_old_name___new_name___scientific_name",
    ]
    taxon_name_query: orm.Query = None
    calculation_modified: int = 0
    calculation_unmodified: int = 0
    calculation_count: int = 0
    calculation_total: int = 0

    @classmethod
    def create_item(
        cls,
        db: orm.Session,
        taxon_name: schema.TaxonNameCreate,
        current_user: int = None,
    ) -> TaxonName:
        """
        This method creates a new TaxonName item in the database.

        :param db: The SQLAlchemy session.
        :param taxon_name: The schema.TaxonNameCreate object containing the data for the
         new TaxonName.
        :param current_user: Optional parameter for the ID of the current user. Defaults
         to None.
        :return: The created TaxonName object.

        Example usage:
        ```python
        db_session = orm.Session()
        new_taxon_name = schema.TaxonNameCreate(
            name="New Taxon Name",
            classification_system_ids=[1, 2, 3]
        )
        created_taxon_name = TaxonNameCrud.create_item(db_session, new_taxon_name,
        current_user=1)
        db_session.close()
        ```
        """
        create_data = taxon_name.dict(exclude_unset=True)
        delattr(taxon_name, "classification_system_ids")
        db_taxon_name = super().create_item(db, taxon_name, current_user=current_user)
        if (
            "classification_system_ids" in create_data
            and create_data["classification_system_ids"]
        ):
            for classification_system_id in create_data["classification_system_ids"]:
                informal_group = InformalGroup(
                    classification_system_id=classification_system_id,
                    taxon_name_id=db_taxon_name.taxon_name_id,
                    created_by=current_user,
                    updated_by=current_user,
                )
                db.add(informal_group)
            db.commit()
        cls.calculate_name_formats(db, db_taxon_name.taxon_name_id)
        return db_taxon_name

    @classmethod
    def edit_item(
        cls,
        db: orm.Session,
        current_user: User,
        taxon_name_id: int,
        taxon_name: schema.TaxonNameEdit,
        **kwargs,
    ) -> TaxonName:
        """
        :param db: an instance of orm.Session used to connect to the database
        :param current_user: an instance of User representing the current user
        :param taxon_name_id: an integer representing the ID of the taxon name to be
         edited
        :param taxon_name: an instance of schema.TaxonNameEdit representing the data to
         update the taxon name with
        :param kwargs: additional keyword arguments
        :return: an instance of TaxonName representing the updated taxon name

        This method is used to edit a taxon name in the database. It takes in the
        necessary parameters such as the database session, the current user, the taxon
        name ID, and the data to update the taxon name with. Additional keyword
        arguments can also be passed if needed.

        The method first extracts the relevant data from the taxon_name parameter using
        the dict() method. If the "classification_system_ids" key is present in the
        update_data, it performs a series of operations to update the associated
        informal groups in the database. It deletes any informal groups that are not
        included in the updated classification_system_ids, then retrieves the current
        classification_system_ids associated with the taxon name. It calculates the
        new_classification_system_ids by finding the symmetric difference between
        classification_system_ids and current_classification_system_ids. It then
        creates new InformalGroup instances for each new classification_system_id and
        adds them to the database session.

        After updating the informal groups, the "classification_system_ids" attribute is
         removed from the taxon_name object. The method then calls the edit_item()
         method from the parent class, passing in the updated taxon name data. The
         edit_item() method performs the actual update in the database and returns the
         updated TaxonName instance.

        Finally, the method returns the updated TaxonName object.

        Example usage:

        db = orm.Session()
        current_user = User(...)
        taxon_name_id = 1
        taxon_name_edit = schema.TaxonNameEdit(...)
        updated_taxon_name = TaxonNameCrud.edit_item(db, current_user, taxon_name_id,
        taxon_name_edit)
        """
        update_data = taxon_name.dict(exclude_unset=True)
        if "classification_system_ids" in update_data:
            classification_system_ids = update_data["classification_system_ids"]
            db.query(InformalGroup).filter(
                InformalGroup.taxon_name_id == taxon_name_id,
                ~InformalGroup.classification_system_id.in_(classification_system_ids),
            ).delete()
            current_classification_system_ids = [
                classification_system_id[0]
                for classification_system_id in db.query(
                    InformalGroup.classification_system_id
                )
                .filter(InformalGroup.taxon_name_id == taxon_name_id)
                .all()
            ]
            new_classification_system_ids = set(classification_system_ids) ^ set(
                current_classification_system_ids
            )
            for classification_system_id in new_classification_system_ids:
                informal_group = InformalGroup(
                    taxon_name_id=taxon_name_id,
                    classification_system_id=classification_system_id,
                    created_by=current_user.user_id,
                    updated_by=current_user.user_id,
                )
                db.add(informal_group)
            db.commit()
            delattr(taxon_name, "classification_system_ids")
        db_taxon_name = super().edit_item(db, current_user, taxon_name_id, taxon_name)
        cls.calculate_name_formats(db, db_taxon_name.taxon_name_id)
        return db_taxon_name

    @classmethod
    def generate_infrageneric_names(
        cls,
        db: orm.Session,
        taxon_name_id: int,
    ) -> List[InfraGenericNameModel]:
        """
        Generates a list of infra-generic names for a given taxon name ID.

        :param db: The SQLAlchemy session object.
        :param taxon_name_id: The ID of the taxon name.
        :return: A list of InfraGenericNameModel objects.
        """
        # This query returns a result with a full hierarchy list for a single taxon_id
        query = cls.get_infrageneric_name_query(db, taxon_name_id)

        result = query.all()

        if not result:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=f"Taxon ID {taxon_name_id} not found"
            )

        # Convert the result to a list of dictionaries for script ingestion
        rows = parse_obj_as(List[schema.TaxonNameRow], result)
        infrageneric_names = InfraGenericNames.generate_names(taxon_name_id, rows)
        return infrageneric_names

    @classmethod
    def get_infrageneric_name_query(
        cls, db: orm.Session, taxon_name_id: int
    ) -> orm.Query:
        hierarchy = orm.aliased(Hierarchy)
        taxon_name = orm.aliased(TaxonName)
        taxon_rank = orm.aliased(TaxonRank)
        subquery = (
            db.query(hierarchy.path, hierarchy.parent_nid)
            .filter(hierarchy.taxon_name_id == taxon_name_id)
            .filter(hierarchy.deleted == False)  # noqa: E712
        )
        subquery = subquery.subquery()
        sub = orm.aliased(Hierarchy, subquery)
        query = (
            db.query(
                taxon_name.taxon_name_id,
                hierarchy.path,
                taxon_name.scientific_name,
                taxon_name.uninomial,
                taxon_name.specific_epithet,
                taxon_name.infraspecific_epithet,
                taxon_name.author,
                taxon_rank.rank_name,
                taxon_rank.rank_abbrev,
                hierarchy.parent_nid,
            )
            .join(taxon_rank, taxon_name.rank_id == taxon_rank.taxon_rank_id)
            .filter(taxon_name.deleted == False)  # noqa: E712
            .join(hierarchy, taxon_name.taxon_name_id == hierarchy.taxon_name_id)
            .filter(hierarchy.deleted == False)  # noqa: E712
            .join(sub, hierarchy.path.op("@>")(sub.path))
            .distinct()
            .order_by(hierarchy.path)
        )
        return query

    @classmethod
    def calculate_name_formats(
        cls,
        db: orm.Session,
        taxon_name_id: Optional[int] = None,
        current_user: int = None,
        limit: Optional[int] = None,
        offset: int = 0,
    ):
        """
        :param db: The SQLAlchemy session object used for database operations.
        :param taxon_name_id: The ID of the taxon name for which to calculate name
         formats. Default is None.
        :param current_user: The ID of the current user. Default is None.
        :param limit: The maximum number of results to return. Default is None.
        :param offset: The number of results to skip. Default is 0.
        :return: None

        Calculate name formats for taxon names in the database. This method retrieves
         distinct taxon_name_id values from the Hierarchy table and calculates name
         formats for each of them. The calculation is performed using the
         `calculate_names_for_row` method in a loop over the query result.

        If `taxon_name_id` is provided, only taxon names with the specified ID will be
        processed. If `limit` is provided, the maximum number of taxon names to process
         will be limited to the specified value. `offset` can be used to skip a certain
         number of taxon names before starting the calculation.

        Note: The `calculate_names_for_row` method is called within a progress bar loop
        provided by the `rich.progress` module, allowing for visual progress tracking of
         the calculation.

        Example usage:

        ```python
        from app.db.taxon_name.crud import TaxonNameCrud

        # Create a SQLAlchemy session object
        db = ...

        # Calculate name formats for all taxon names
        TaxonNameCrud.calculate_name_formats(db)

        # Calculate name formats for a specific taxon name
        TaxonNameCrud.calculate_name_formats(db, taxon_name_id=123)

        # Calculate name formats with a limit and offset
        TaxonNameCrud.calculate_name_formats(db, limit=100, offset=50)
        ```
        """
        log = loguru.logger.add(CALCULATE_LOG, retention="1 day")
        loguru.logger.info("Calculation started")
        cls.taxon_name_query = db.query(TaxonName)
        cls.reset_counts()
        query: orm.Query = db.query(Hierarchy.taxon_name_id).distinct()
        query = query.where(Hierarchy.deleted == False)  # noqa: E712
        if taxon_name_id:
            query = query.where(Hierarchy.taxon_name_id == taxon_name_id)
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)
        cls.calculation_total = query.count()

        for row in rich.progress.track(
            query, total=query.count(), description="Calculating name formats"
        ):
            cls.calculate_names_for_row(db, row, current_user)
        db.flush()
        loguru.logger.debug(cls.format_message())
        loguru.logger.info("Calculation completed")
        loguru.logger.remove(log)

    @classmethod
    def calculate_names_for_row(cls, db: orm.Session, row, current_user: int = None):
        taxon_name_id = row.taxon_name_id
        taxon_name: TaxonName = cls.taxon_name_query.get(taxon_name_id)
        rows = cls.get_infrageneric_name_query(db, taxon_name_id)
        infrageneric_names = InfraGenericNames.generate_names(row.taxon_name_id, rows)
        for name_entry in infrageneric_names:
            if name_entry.name_version == CANONICAL:
                taxon_name.canonical_name = name_entry.formatted_name
            elif name_entry.name_version == CANONICAL_WITHOUT_RANK:
                taxon_name.canonical_name_without_rank = name_entry.formatted_name
            elif name_entry.name_version == INFRAGENUS_WITH_RANK:
                taxon_name.scientific_name = name_entry.formatted_name_with_author
                taxon_name.formatted_scientific_name = (
                    calculate_formatted_scientific_name(
                        name_entry.formatted_name, name_entry.author
                    )
                )
        if db.is_modified(taxon_name):
            taxon_name.calculate_name = False
            if current_user:
                taxon_name.updated_by = current_user
            db.add(taxon_name)
            db.commit()
            cls.calculation_modified += 1
        else:
            cls.calculation_unmodified += 1
        cls.calculation_count += 1
        if cls.calculation_count % 100 == 0:
            loguru.logger.debug(cls.format_message())

    @classmethod
    def format_message(cls):
        return {
            "count": cls.calculation_count,
            "total": cls.calculation_total,
            "modified": cls.calculation_modified,
            "unmodified": cls.calculation_unmodified,
        }

    @classmethod
    def reset_counts(cls):
        cls.calculation_count = 0
        cls.calculation_total = 0
        cls.calculation_modified = 0
        cls.calculation_unmodified = 0
