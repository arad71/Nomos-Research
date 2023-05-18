from sqlalchemy import orm

from app.db.citation.crud import CitationCrud
from app.db.citation.model import Citation


def delete_author_citations(
    session: orm.Session, current_user, author_id: int, hard: bool
):
    citation_ids = (
        session.query(Citation)
        .filter(Citation.author_id == author_id)
        .with_entities(Citation.citation_id)
    )
    for citation_id in citation_ids:
        CitationCrud.delete_item(session, current_user, citation_id[0], hard)
