import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

import app.db.author.schema as schema
from app.db.author.model import Author as model
from app.db.publication_author.schema import AuthorSchema


def get_author(db: Session, author_id: int):
    author = db.query(model).filter(model.author_id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


def get_authors(db: Session, skip: int = 0, limit: int = 100) -> t.List[AuthorSchema]:
    return (
        db.query(model)
        .options(joinedload(model.publication))
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_author(db: Session, author: schema.AuthorCreate):
    db_author = model(
        author=author.author,
        surname=author.surname,
        first_names=author.first_names,
        initials=author.initials,
        orc_id=author.orc_id,
        updated_by=author.updated_by,
        updated_on=author.updated_on,
        created_by=author.created_by,
        created_on=author.created_on,
    )
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author


def delete_author(db: Session, author_id: int):
    author = get_author(db, author_id)
    if not author:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Author not found")
    db.delete(author)
    db.commit()
    return author


def edit_author(db: Session, author_id: int, author: schema.AuthorEdit) -> schema:
    db_author = get_author(db, author_id)
    if not db_author:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Author not found")
    update_data = author.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_author, key, value)

    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author
