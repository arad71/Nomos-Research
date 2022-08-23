import datetime
import json
import re
import typing as t

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
    search_fields: list[str] = []
    model: Base = None
    name: str = None
    id_key: str = None
    PATH_PATTERN = "(\\w+)__(ancestor_of|descendant_of|ltxtquery|lquery__(.+)|lquery)"

    @classmethod
    def create_item(
        cls, db: Session, item: BaseModel, current_user: int = None
    ) -> Base:
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
        if current_user.is_super_admin():
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
        item = db.query(cls.model).filter(getattr(cls.model, property) == value).first()
        return item

    @staticmethod
    def _get_timestamp_range(date_string):
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
        limit, skip, range_str = cls.get_skip_and_limit(range)
        query = db.query(cls.model)
        # See https://bit.ly/388m5sY for details on how sorting and filtering is
        # implemented using the smart_query from sqlalchemy_mixins

        sort_attrs = []
        if sort:
            sort_by, sort_dir = cls.get_sort(sort)
            sort_by = sort_by.split(",") if sort_by else []
            sort_dir = sort_dir.split(",") if sort_dir else []
            for i, sort_field in enumerate(sort_by):
                direction = "-" if sort_dir and sort_dir[i] == "DESC" else ""
                sort_value = f"{direction}{sort_field}"
                sort_attrs.append(sort_value)
        filters = {"deleted": False} if hasattr(cls.model, "deleted") else {}
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
                elif column == "q":
                    if cls.search_fields:
                        conditions = {}
                        for search_field in cls.search_fields:
                            conditions[f"{search_field}__contains"] = filter_value
                        filters[or_] = conditions
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
                    if hasattr(cls.model, column) and isinstance(
                        getattr(cls.model, column).type, TIMESTAMP
                    ):
                        column = f"{column}__between"
                        filter_value = cls._get_timestamp_range(filter_value)
                    elif isinstance(filter_value, list):
                        column = f"{column}__in"
                    filters[column] = filter_value
        try:
            query = smart_query(query, filters=filters, sort_attrs=sort_attrs or None)
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
    def add_path_filters(cls, filter_value, path_match, query):
        # Filtering using sqlalchemy ltree path
        # See https://www.kite.com/blog/python/sqlalchemy/
        column = path_match.group(1)
        search = path_match.group(2)
        path_attr = getattr(cls.model, column)
        search_attr = getattr(path_attr, search)
        # TODO: Support multiple hierarchies here by filtering by each
        #  hierarchy rather than just the first one
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
        query = query.where(search_attr(filter_value))
        return query

    @classmethod
    def add_ancestral_rank_filter(
        cls, column: str, filter_value: t.Any, query: Query
    ) -> tuple[bool, Query]:
        added_rank_filter = False
        if column in [
            "division",
            "phylum",
            "taxon_class",
            "order",
            "family",
            "genus",
            "subgenus",
            "species",
            "subspecies",
        ]:
            if cls.model == TaxonNameModel:
                added_rank_filter = True
                ancestor = aliased(Hierarchy)
                taxon_name = aliased(cls.model)
                ancestor_name = aliased(TaxonNameModel)
                hierarchy = aliased(Hierarchy)
                taxon_rank = aliased(TaxonRank)
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

                query = query.filter(
                    ancestor_name.scientific_name.ilike(f"{filter_value}%")
                )
        return added_rank_filter, query

    @staticmethod
    def get_skip_and_limit(range):
        range = json.loads(range)
        start = range[0] or 0
        end = range[1] or settings.DEFAULT_PAGE_SIZE
        limit = end - start + 1
        return limit, start, f"{start}-{end}"

    @classmethod
    def get_sort(cls, sort):
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
