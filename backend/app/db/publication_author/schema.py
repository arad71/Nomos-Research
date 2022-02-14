from typing import List

from app.db.author.schema import Author
from app.db.publication.schema import Publication


class AuthorSchema(Author):
    publications: List[Publication]


class PublicationSchema(Publication):
    authors: List[Author]
