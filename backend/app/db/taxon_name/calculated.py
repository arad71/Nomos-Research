from itertools import groupby
from operator import attrgetter

from sqlalchemy import asc, desc

from app.db.citation.enums import AuthorType
from app.db.taxon_name.constants import ANIMAL_KINGDOM_NAME, PLANTAE_KINGDOM_NAME
from app.db.taxon_rank.enums import RankAbbreviationVals


def calculate_fields(mapper, connection, target):
    target.canonical_name = map_canonical_name(mapper, connection, target)
    # If we don't have an ID yet we cannot have relationships
    if hasattr(target, "taxon_name_id") and target.taxon_name_id:
        target.author = map_authors(mapper, connection, target)
        target.vernacular = map_vernacular(target)
        target.all_vernaculars = map_vernaculars(target)

    if any([target.canonical_name, target.author]):
        target.scientific_name = " ".join(
            filter(None, [target.canonical_name, target.author])
        )
        target.formatted_scientific_name = " ".join(
            filter(
                None,
                [
                    f"<i class='canonical-name'>{target.canonical_name}</i>",
                    target.author,
                ],
            )
        )

    if hasattr(target, "taxon_name_id") and target.taxon_name_id:
        target.editor = map_editors(mapper, connection, target)


def map_canonical_name(mapper, connection, target):
    vals = [target.uninomial, target.specific_epithet]
    if target.kingdom and target.kingdom.kingdom_name == PLANTAE_KINGDOM_NAME:
        if target.taxon_rank.rank_abbrev:
            vals.append(RankAbbreviationVals[target.taxon_rank.rank_abbrev])
    vals.append(target.infraspecific_epithet)
    return " ".join(filter(None, vals))


def map_authors(mapper, connection, target):
    citations = target.citations.filter_by(deleted=False)\
        .order_by(asc("author_type"))\
        .order_by(asc("author_order"))  # fmt: skip

    author_types = {
        k: list(g) for k, g in groupby(citations, attrgetter("author_type"))
    }

    if target.kingdom.kingdom_name == ANIMAL_KINGDOM_NAME:
        if AuthorType.basionym in author_types:
            val = stringify_citation_authors(author_types[AuthorType.basionym])
            return f"({val}, {target.form_desc_yr})"
        elif AuthorType.current in author_types:
            val = stringify_citation_authors(author_types[AuthorType.current])
            return f"{val}, {target.form_desc_yr}"
    else:
        val = ""
        if AuthorType.basionym in author_types:
            basionym_authors = stringify_citation_authors(
                author_types[AuthorType.basionym]
            )
            val = f"({basionym_authors})"
        if AuthorType.current in author_types:
            current_authors = stringify_citation_authors(
                author_types[AuthorType.current]
            )
            val = " ".join(filter(None, [val, current_authors]))
        if val:
            return val

    return None


def stringify_citation_authors(authors):
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


def map_editors(mapper, connection, target):
    citations = target.citations.filter_by(author_type="editor").order_by(
        asc("author_order")
    )

    if citations.count():
        return stringify_citation_authors(list(citations))

    return None


def map_vernacular(target):
    vernacular = (
        target.vernaculars.filter_by(deleted=False, preferred=True)
        .order_by(asc("sort_order"))
        .first()
    )
    if vernacular:
        return vernacular.vernacular
    return None


def map_vernaculars(target):
    vernaculars = target.vernaculars.filter_by(deleted=False, enabled=True).order_by(
        desc("preferred")
    )
    if vernaculars.count:
        return ", ".join(
            filter(
                None,
                [vernacular.vernacular for vernacular in vernaculars],
            )
        )
    return None
