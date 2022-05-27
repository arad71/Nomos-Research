from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.crud as crud
import app.db.publication.schema as schema
from app.db.models import PublicationAuthor
from app.db.publication.model import Publication


class PublicationCrud(crud.Crud):
    model = Publication
    id_key = "publication_id"
    name = "Publication"
    search_fields = [
        "title",
        "display_title",
    ]

    @classmethod
    def create_item(
        cls,
        db: Session,
        publication: schema.PublicationCreate,
        raise_exception: bool = True,
        current_user: int = None,
    ):
        db_publication = Publication()
        create_data = publication.dict(exclude_unset=True)
        create_data.pop("author_names", None)
        create_data.pop("author_ids", None)
        create_data["created_by"] = current_user
        create_data["updated_by"] = current_user

        for key, value in create_data.items():
            setattr(db_publication, key, value)
        db.add(db_publication)
        db.commit()
        db.refresh(db_publication)
        publication_id = db_publication.publication_id

        if publication.author_ids:
            for author_id in publication.author_ids:
                user_role = PublicationAuthor(
                    author_id=author_id,
                    publication_id=publication_id,
                )
                db.add(user_role)
            db.commit()
            db.commit()
        return db_publication

    @classmethod
    def edit_item(
        cls,
        db: Session,
        publication_id: int,
        publication: schema.PublicationEdit,
        raise_exception: bool = True,
        current_user: int = None,
        **kwargs,
    ) -> Publication:
        db_publication = PublicationCrud.get_item(db, publication_id)
        if not db_publication:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail="Publication not found"
            )
        update_data = publication.dict(exclude_unset=True)
        update_data.pop("author_names", None)

        if "author_ids" in update_data:
            author_ids = update_data["author_ids"]
            db.query(PublicationAuthor).filter(
                PublicationAuthor.publication_id == publication_id,
                ~PublicationAuthor.author_id.in_(author_ids),
            ).delete()
            current_author_ids = [
                author_id[0]
                for author_id in db.query(PublicationAuthor.author_id)
                .filter(PublicationAuthor.publication_id == publication_id)
                .all()
            ]
            new_author_ids = set(author_ids) ^ set(current_author_ids)
            for author_id in new_author_ids:
                publication_author = PublicationAuthor(
                    publication_id=publication_id,
                    author_id=author_id,
                )
                db.add(publication_author)

        update_data.pop("author_ids", None)
        update_data["updated_by"] = current_user
        for key, value in update_data.items():
            setattr(db_publication, key, value)

        db.add(db_publication)
        db.commit()
        db.refresh(db_publication)
        return db_publication
