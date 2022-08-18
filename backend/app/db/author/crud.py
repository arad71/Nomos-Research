import typing as t

from sqlalchemy.orm import Session, joinedload

import app.db.crud as crud
from app.db.author.calculated import delete_author_citations
from app.db.author.model import Author
from app.db.session import Base
from app.db.user.schema import User


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

    @classmethod
    def delete_item(
        cls, db: Session, current_user: User, author_id: int, hard: bool = False
    ):
        author = cls.get_item(db, current_user, author_id)
        super().delete_item(db, current_user, author_id, hard)
        delete_author_citations(db, current_user, author_id, hard)
        db.commit()
        if hard:
            return {cls.id_key: author_id}
        db.refresh(author)
        return author
