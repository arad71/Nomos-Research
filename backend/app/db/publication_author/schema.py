from typing import List

from app.db.publication.schema import Publication
from app.db.author.schema import Author


class AuthorSchema(Author):
    publications: List[Publication]


class PublicationSchema(Publication):
    authors: List[Author]
