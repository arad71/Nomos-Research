import typing as t

from sqlalchemy.orm import Session, joinedload

import app.db.crud as crud
from app.db.author.model import Author
from app.db.session import Base


class AuthorCrud(crud.Crud):
    model = Author
    id_key = "author_id"
    name = "Author"
    search_fields = ["abbreviation", "first_names", "surname", "initials", "orc_id"]

    def get_authors(cls, db: Session, skip: int = 0, limit: int = 100) -> t.List[Base]:
        return (
            db.query(cls.model)
            .options(joinedload(cls.model.publication))
            .offset(skip)
            .limit(limit)
            .all()
        )
