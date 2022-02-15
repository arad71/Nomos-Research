import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.author.schema as schema
from app.db.author.model import Author as model


def get_author(db: Session, author_id: int):
    author = db.query(model).filter(model.author_id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


def get_authors(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.AuthorBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_author(db: Session, author: schema.AuthorCreate, current_user: int):
    db_author = model(
        author=author.author,
        surname=author.surname,
        first_names=author.first_names,
        initials=author.initials,
        orc_id=author.orc_id,
        created_by=current_user,
        updated_by=current_user,
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


def edit_author(
    db: Session, author_id: int, author: schema.AuthorEdit, current_user: int
) -> schema:
    db_author = get_author(db, author_id)
    if not db_author:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Author not found")
    update_data = author.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_author, key, value)

    setattr(db_author, "updated_by", current_user)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author
