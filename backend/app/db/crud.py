import json
import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import Base


class Crud:
    DEFAULT_LIMIT: 10

    @classmethod
    def create_item(cls, db: Session, item: object, current_user: int):
        db_item = cls.model(**item.dict())
        setattr(db_item, "created_by", current_user)
        setattr(db_item, "updated_by", current_user)

        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @classmethod
    def get_item(cls, db: Session, id: int):
        item = db.query(cls.model).filter(getattr(cls.model, cls.id_key) == id).first()
        print(getattr(cls.model, cls.id_key))
        if not item:
            raise HTTPException(status_code=404, detail=cls.name + " not found")
        return item

    @classmethod
    def get_items(cls, db: Session, range: str = "[0, 10]") -> t.List[Base]:
        range = json.loads(range)
        skip = range[0] or 0
        limit = range[1] or Crud.DEFAULT_LIMIT
        limit = limit - skip
        return db.query(cls.model).offset(skip).limit(limit).all()

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
        return item
