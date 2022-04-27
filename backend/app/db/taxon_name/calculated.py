from itertools import groupby
from operator import attrgetter

from sqlalchemy import asc

from app.db.citation.enums import AuthorType


def calculate_fields(mapper, connection, target):
    target.canonical_name = map_canonical_name(mapper, connection, target)
    # If we don't have an ID yet we cannot have relationships
    if hasattr(target, "taxon_name_id") and target.taxon_name_id:
        target.author = map_authors(mapper, connection, target)


def map_canonical_name(mapper, connection, target):
    canonical_name_vals = list(
        filter(
            None, [target.genus, target.specific_epithet, target.infraspecific_epithet]
        )
    )
    return " ".join(canonical_name_vals)


def map_authors(mapper, connection, target):
    citations = target.citations\
        .order_by(asc("author_type"))\
        .order_by(asc("author_order"))  # fmt: skip

    author_types = {
        k: list(g) for k, g in groupby(citations, attrgetter("author_type"))
    }

    # TODO Replace hardcoded string with constant
    if target.kingdom.kingdom_name == "Animalia":
        if AuthorType.basionym in author_types:
            val = stringify_author_group(author_types[AuthorType.basionym])
            return f"({val} {target.form_desc_yr})"
        elif AuthorType.current in author_types:
            val = stringify_author_group(author_types[AuthorType.current])
            return f"{val} {target.form_desc_yr}"
    else:
        val = ""
        if AuthorType.basionym in author_types:
            basionym_authors = stringify_author_group(author_types[AuthorType.basionym])
            val = f"({basionym_authors})"
        if AuthorType.current in author_types:
            current_authors = stringify_author_group(author_types[AuthorType.current])
            val = " ".join([val, current_authors])
        if val:
            return val

    return None


def stringify_author_group(authors):
    if not authors:
        return ""

    last = authors.pop()
    return " & ".join(
        filter(
            None,
            [
                ", ".join([k.author.abbreviation for k in authors]),
                last.author.abbreviation,
            ],
        )
    )
