import json
import typing as t

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy_mixins.smartquery import smart_query

from app.core.config import settings
from app.db.session import Base


class Crud:
    search_fields: list[str] = []
    model: Base = None
    name: str = None
    id_key: str = None

    @classmethod
    def create_item(cls, db: Session, item: BaseModel, current_user: int = None):
        db_item = cls.model(**item.dict())
        if current_user:
            setattr(db_item, "created_by", current_user)
            setattr(db_item, "updated_by", current_user)

        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @classmethod
    def get_item(cls, db: Session, id: int):
        item = db.query(cls.model).filter(getattr(cls.model, cls.id_key) == id).first()
        if not item:
            raise HTTPException(status_code=404, detail=cls.name + " not found")
        return item

    @classmethod
    def get_by_property(cls, db: Session, property: str, value: any):
        item = db.query(cls.model).filter(getattr(cls.model, property) == value).first()
        return item

    @classmethod
    def get_items(
        cls,
        db: Session,
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

        filters = {}
        if list_filter:
            filter_items = json.loads(list_filter)
            column: str
            for column in filter_items:
                filter_value = filter_items[column]
                if column == "q":
                    if cls.search_fields:
                        conditions = {}
                        for search_field in cls.search_fields:
                            conditions[f"{search_field}__contains"] = filter_value
                        filters[or_] = conditions
                else:
                    if isinstance(filter_value, list):
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
    def get_skip_and_limit(cls, range):
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
        cls, db: Session, id: int, values: object, current_user: int
    ) -> object:
        db_item = cls.get_item(db, id)
        if not db_item:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=cls.name + " not found"
            )
        update_data = values.dict(exclude_unset=True)

        for key, value in update_data.items():
            setattr(db_item, key, value)

        setattr(db_item, "updated_by", current_user)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @classmethod
    def delete_item(cls, db: Session, id: int):
        item = cls.get_item(db, id)
        if not item:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=cls.name + " not found"
            )
        db.delete(item)
        db.commit()
        return {cls.id_key: id}
