import datetime
import json
import re
import typing as t
from typing import Union

from fastapi import HTTPException, Security, status
from pydantic import BaseModel
from sqlalchemy import and_, or_
from sqlalchemy.orm import Query, Session, aliased
from sqlalchemy.sql import expression
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy_mixins.smartquery import smart_query
from sqlalchemy_utils import Ltree
from sqlalchemy_utils.types.ltree import LQUERY, LTXTQUERY

from app.core.config import settings
from app.db.hierarchy.model import Hierarchy
from app.db.role.constants import Role
from app.db.session import Base
from app.db.taxon_name.model import TaxonName as TaxonNameModel
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User


class Crud:
    """Base CRUD class for Nomos"""

    search_fields: list[str] = []
    model: Base = None
    name: str = None
    id_key: str = None
    PATH_PATTERN = "(\\w+)__(ancestor_of|descendant_of|ltxtquery|lquery|in_tree)"

    @classmethod
    def create_item(
        cls, db: Session, item: BaseModel, current_user: int = None
    ) -> Base:
        """
        Create an item in the database
        :param db:
        :param item:
        :param current_user:
        :return: Base
        """
        db_item: Base = cls.model(**item.dict())
        if current_user:
            setattr(db_item, "created_by", current_user)
            setattr(db_item, "updated_by", current_user)

        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @classmethod
    def get_item(cls, db: Session, current_user: User, id: int) -> Base:
        """
        Get an item from the database.

        :param db: The database session object.
        :type db: Session
        :param current_user: An instance of the User model representing the user making
         the request.
        :type current_user: User
        :param id: The ID of the item to retrieve.
        :type id: int
        :return: The item retrieved from the database.
        :rtype: Base
        :raises HTTPException: If the item is not found in the database.
        """
        if Security(
            dependency=current_user,
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.APPLICATION_SUPPORT["name"],
            ],
            use_cache=False,
        ):
            item = (
                db.query(cls.model).filter(getattr(cls.model, cls.id_key) == id).first()
            )
        else:
            item = (
                db.query(cls.model)
                .filter(
                    getattr(cls.model, cls.id_key) == id,
                    getattr(cls.model, "deleted") == False,  # noqa
                )
                .first()
            )
        if not item:
            raise HTTPException(status_code=404, detail=cls.name + " not found")
        return item

    @classmethod
    def get_by_property(cls, db: Session, property: str, value: any):
        """
        Retrieve a single item from the database based on a property value

        :param db: The SQLAlchemy Session object
        :param property: The name of the property to filter on
        :param value: The value of the property to filter on
        :return: The retrieved item object"""
        item = db.query(cls.model).filter(getattr(cls.model, property) == value).first()
        return item

    @staticmethod
    def _get_timestamp_range(date_string: str) -> tuple[datetime, datetime]:
        day_start = datetime.datetime.strptime(date_string, "%Y-%m-%d")
        day_end = datetime.datetime.strptime(
            date_string + "T23:59:59", "%Y-%m-%dT%H:%M:%S"
        )
        return day_start, day_end

    @classmethod
    def get_items(
        cls,
        db: Session,
        current_user: User,
        range: str = f"[0,{settings.DEFAULT_PAGE_SIZE}]",
        sort: str = None,
        list_filter: str = None,
    ) -> (t.List[Base], str):
        """
        Performs a search in the database for records of this class in the database
        given an optional range and filters. Filters can be specified using the format
        at https://bit.ly/388m5sY for details on how sorting and filtering is
        # implemented using the smart_query from sqlalchemy_mixins
        :param db: Session
        :param current_user: User
        :param range: str formatted range string matching the pattern [n,o] where n =
        start and o is the end.
        :param sort: str formatted list of sort fields specified as:
            field_1,field2
        :param list_filter: Filters in JSON format
        :return: t.List[Base] of records for current page, range string specifying how
        many records shown and
        total number of records
        """
        limit, skip, range_str = cls.get_skip_and_limit(range)
        query = db.query(cls.model)

        filters = {"deleted": False} if hasattr(cls.model, "deleted") else {}
        query = cls.get_query_from_filters(current_user, filters, list_filter, query)
        try:
            query = smart_query(
                query, filters=filters, sort_attrs=cls.get_sort_attributes(sort) or None
            )
        except KeyError as err:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY, detail=err.__repr__()
            )
        # Number of filtered results without offset or limit
        total = query.count()
        content_range = f"{range_str}/{total}"
        # Results with limit and offset
        results = query.offset(skip).limit(limit).all()
        return results, content_range

    @classmethod
    def get_query_from_filters(
        cls, current_user: User, filters: dict, list_filter: str, query: Query
    ) -> Query:
        """
        Constructs a SQLAlchemy Query object based on the filter conditions provided.

        :param current_user: An instance of the User model representing the user making
         the request.
        :type current_user: User
        :param filters: A dictionary containing filter conditions.
        :type filters: dict
        :param list_filter: A JSON string containing a dictionary of filter conditions.
        :type list_filter: str
        :param query: An instance of the SQLAlchemy Query object.
        :type query: Query
        :return: An instance of the SQLAlchemy Query object with the filter conditions
         applied.
        :rtype: Query
        """
        if list_filter:
            filter_items = json.loads(list_filter)
            column: str
            for column in filter_items:
                filter_value = filter_items[column]
                path_match = re.match(cls.PATH_PATTERN, column)
                added_rank_filter, query = cls.add_ancestral_rank_filter(
                    column, filter_value, query
                )
                if added_rank_filter:
                    pass
                else:
                    query = cls.apply_filter(
                        current_user, filters, column, filter_value, path_match, query
                    )
        return query

    @classmethod
    def apply_filter(
        cls,
        current_user: User,
        filters: dict,
        column,
        filter_value,
        path_match,
        query: Query,
    ):
        if column == "q":
            if cls.search_fields:
                conditions = {}
                for search_field in cls.search_fields:
                    conditions[f"{search_field}__contains"] = filter_value
                filters[or_] = conditions
        elif column == "id" and cls.id_key and cls.id_key != "id":
            filters[cls.id_key] = filter_value
        elif column == "deleted":
            # Let super admin and application support override the filter
            if Security(
                dependency=current_user,
                scopes=[
                    Role.SUPER_ADMIN["name"],
                    Role.APPLICATION_SUPPORT["name"],
                ],
                use_cache=False,
            ):
                filters[column] = filter_value
        elif path_match:
            query = cls.add_path_filters(filter_value, path_match, query)
        else:
            query = cls.apply_general_filter(
                filters, column, filter_value, cls.model, query
            )
        return query

    @classmethod
    def apply_general_filter(cls, filters, column, filter_value, model, query):
        if hasattr(model, column) and isinstance(
            getattr(model, column).type, TIMESTAMP
        ):
            column = f"{column}__between"
            filter_value = cls._get_timestamp_range(filter_value)
        elif isinstance(filter_value, list):
            column = f"{column}__in"
        filters[column] = filter_value
        return query

    @classmethod
    def get_sort_attributes(cls, sort: str) -> list[str]:
        """
        This method takes a string 'sort' containing comma separated field names and
        sort directions and returns a list of sort attributes that can be used for
        sorting a queryset.

        :param sort: A string containing comma separated field names and sort
         directions.
        :type sort: str
        :return: A list of sort attributes.
        :rtype: list[str]"""
        sort_attrs = []
        if sort:
            sort_by, sort_dir = cls.get_sort(sort)
            sort_by = sort_by.split(",") if sort_by else []
            sort_dir = sort_dir.split(",") if sort_dir else []
            for i, sort_field in enumerate(sort_by):
                direction = "-" if sort_dir and sort_dir[i] == "DESC" else ""
                sort_value = f"{direction}{sort_field}"
                sort_attrs.append(sort_value)
        return sort_attrs

    @classmethod
    def add_path_filters(
        cls, filter_value: t.Any, path_match: re.Match, query: Query
    ) -> Query:
        # Filtering using sqlalchemy ltree path
        # See https://www.kite.com/blog/python/sqlalchemy/
        column = path_match.group(1)
        search = path_match.group(2)
        path_attr = getattr(cls.model, column)
        search_attr = getattr(path_attr, search, None)
        # TODO: Future potential enhancement - support multiple hierarchies here by
        #  filtering by each hierarchy rather than just the first one. There has not
        #  been any demand for this.
        if isinstance(filter_value, list):
            if len(filter_value) < 1:
                filter_value = "no_filter"
            else:
                filter_value = filter_value.pop()
        filter_value = str(filter_value)
        cast = None
        if search == "ltxtquery":
            cast = LTXTQUERY
        elif search == "lquery":
            cast = LQUERY
        if cast:
            filter_value = expression.cast(str(filter_value), cast)
        else:
            filter_value = Ltree(filter_value)
        if search == "in_tree":
            in_tree = or_(
                path_attr.ancestor_of(filter_value),
                path_attr.descendant_of(filter_value),
            )
            query = query.where(in_tree)
        else:
            query = query.where(search_attr(filter_value))
        return query

    @classmethod
    def add_ancestral_rank_filter(
        cls, column: str, filter_value: t.Any, query: Query
    ) -> tuple[bool, Query]:
        """
        Adds a filter to the query to retrieve records with a specified rank in the
        taxonomic hierarchy.

        :param column: A string representing the taxonomic rank to filter by.
        :type column: str
        :param filter_value: A value to filter by.
        :type filter_value: Any
        :param query: The SQLAlchemy Query object.
        :type query: Query
        :return: A tuple containing a boolean indicating whether the filter was added
        and the updated query object.
        :rtype: tuple[bool, Query]
        """
        added_rank_filter = False

        # Check if column is a valid taxonomic rank
        if column in [
            "division",
            "phylum",
            "class",
            "order",
            "family",
            "genus",
            "subgenus",
            "species",
            "subspecies",
        ]:
            # Check if model is TaxonNameModel
            if cls.model == TaxonNameModel:
                added_rank_filter = True
                ancestor = aliased(Hierarchy)
                taxon_name = aliased(cls.model)
                ancestor_name = aliased(TaxonNameModel)
                hierarchy = aliased(Hierarchy)
                taxon_rank = aliased(TaxonRank)

                # Join tables to retrieve records with specified taxonomic rank
                query = (
                    query.join(
                        taxon_name,
                        cls.model.taxon_name_id == taxon_name.taxon_name_id,
                    )
                    .join(
                        hierarchy,
                        hierarchy.taxon_name_id == taxon_name.taxon_name_id,
                    )
                    .join(
                        ancestor,
                        hierarchy.path.descendant_of(ancestor.path),
                    )
                    .join(
                        ancestor_name,
                        ancestor.taxon_name_id == ancestor_name.taxon_name_id,
                    )
                    .join(
                        taxon_rank,
                        and_(
                            ancestor_name.rank_id == taxon_rank.taxon_rank_id,
                            taxon_rank.rank_name == column.capitalize(),
                        ),
                    )
                )

                # Add filter to retrieve records with scientific name that starts with
                # the specified filter value
                query = query.filter(
                    ancestor_name.scientific_name.ilike(f"{filter_value}%")
                )
        return added_rank_filter, query

    @staticmethod
    def get_skip_and_limit(
        range_string: str,
    ) -> tuple[Union[int, str], Union[int, str], str]:
        """
        Parses a range string and returns the skip, limit, and range header.

        :param range_string: A JSON string containing the range information.
        :type range_string: str
        :return: A tuple containing the limit, skip, and range header.
        :rtype: tuple[Union[int, str], Union[int, str], str]"""
        range_string = json.loads(range_string)
        start = range_string[0] or 0
        end = range_string[1] or settings.DEFAULT_PAGE_SIZE
        limit = end - start + 1
        return limit, start, f"{start}-{end}"

    @classmethod
    def get_sort(cls, sort: str) -> tuple[str, str]:
        """
        Parses the given sort string in JSON format and returns a tuple containing the
         sort_by and sort_dir values.

        :param sort: The sort string in JSON format.
        :type sort: str
        :return: A tuple containing the sort_by and sort_dir values.
        :rtype: tuple[str, str]"""
        data = json.loads(sort)
        sort_by = data[0] or None
        sort_dir = data[1] or None
        return sort_by, sort_dir

    @classmethod
    def get_items_count(cls, db: Session) -> int:
        return db.query(cls.model).count()

    @classmethod
    def edit_item(
        cls, db: Session, current_user: User, id: int, values: BaseModel
    ) -> Base:
        """
        Edit an existing item.

        :param db: SQLAlchemy database session
        :type db: sqlalchemy.orm.Session
        :param current_user: Current authenticated user
        :type current_user: models.User
        :param id: ID of item to edit
        :type id: int
        :param values: New values for item
        :type values: pydantic.BaseModel
        :return: Updated item
        :rtype: models.Base
        :raises HTTPException 404: Item not found
        """
        db_item = cls.get_item(db, current_user, id)
        if not db_item:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=cls.name + " not found"
            )
        update_data = values.dict(exclude_unset=True)

        for key, value in update_data.items():
            setattr(db_item, key, value)

        setattr(db_item, "updated_by", current_user.user_id)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @classmethod
    def delete_item(cls, db: Session, current_user: User, id: int, hard: bool = False):
        """
        Delete an item.

        :param db: SQLAlchemy database session
        :type db: sqlalchemy.orm.Session
        :param current_user: Current authenticated user
        :type current_user: models.User
        :param id: ID of item to delete
        :type id: int
        :param hard: Whether to hard delete item or mark it as deleted, defaults to
         False
        :type hard: bool, optional
        :return: ID of deleted item or deleted item
        :rtype: dict or models.Base
        :raises HTTPException 404: Item not found
        """
        item = cls.get_item(db, current_user, id)
        if not item:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=cls.name + " not found"
            )
        if hard:
            item_id = getattr(item, cls.id_key)
            db.delete(item)
            db.commit()
            return {cls.id_key: item_id}
        item.deleted = True
        item.updated_by = current_user.user_id
        db.commit()
        db.refresh(item)
        return item

    @classmethod
    def undelete_item(cls, db: Session, current_user: User, id: int):
        """
        Undelete a previously deleted item.

        :param db: SQLAlchemy database session
        :type db: sqlalchemy.orm.Session
        :param current_user: Current authenticated user
        :type current_user: models.User
        :param id: ID of item to undelete
        :type id: int
        :return: Undeleted item
        :rtype: models.Base
        :raises HTTPException 404: Item not found
        """
        item = cls.get_item(db, current_user, id)
        if not item:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=cls.name + " not found"
            )
        item.deleted = False
        item.updated_by = current_user.user_id
        db.commit()
        db.refresh(item)
        return item
