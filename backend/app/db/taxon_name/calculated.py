from itertools import groupby
from operator import attrgetter

from sqlalchemy import asc

from app.db.citation.enums import AuthorType
from app.db.taxon_name.constants import ANIMAL_KINGDOM_NAME, PLANTAE_KINGDOM_NAME
from app.db.taxon_rank.enums import RankAbbreviationVals


def calculate_fields(mapper, connection, target):
    target.canonical_name = map_canonical_name(mapper, connection, target)
    # If we don't have an ID yet we cannot have relationships
    if hasattr(target, "taxon_name_id") and target.taxon_name_id:
        target.author = map_authors(mapper, connection, target)

    target.scientific_name = " ".join(
        filter(None, [target.canonical_name, target.author])
    )
    target.formatted_scientific_name = " ".join(
        filter(
            None,
            [f"<i class='canonical-name'>{target.canonical_name}</i>", target.author],
        )
    )


def map_canonical_name(mapper, connection, target):
    vals = [target.genus, target.specific_epithet]
    if target.kingdom and target.kingdom.kingdom_name == PLANTAE_KINGDOM_NAME:
        if target.taxon_rank.rank_abbrev:
            vals.append(RankAbbreviationVals[target.taxon_rank.rank_abbrev])
    vals.append(target.infraspecific_epithet)
    return " ".join(filter(None, vals))


def map_authors(mapper, connection, target):
    citations = target.citations\
        .order_by(asc("author_type"))\
        .order_by(asc("author_order"))  # fmt: skip

    author_types = {
        k: list(g) for k, g in groupby(citations, attrgetter("author_type"))
    }

    if target.kingdom.kingdom_name == ANIMAL_KINGDOM_NAME:
        if AuthorType.basionym in author_types:
            val = stringify_author_group(author_types[AuthorType.basionym])
            return f"({val}, {target.form_desc_yr})"
        elif AuthorType.current in author_types:
            val = stringify_author_group(author_types[AuthorType.current])
            return f"{val}, {target.form_desc_yr}"
    else:
        val = ""
        if AuthorType.basionym in author_types:
            basionym_authors = stringify_author_group(author_types[AuthorType.basionym])
            val = f"({basionym_authors})"
        if AuthorType.current in author_types:
            current_authors = stringify_author_group(author_types[AuthorType.current])
            val = " ".join(filter(None, [val, current_authors]))
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
