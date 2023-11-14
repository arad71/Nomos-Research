from __future__ import annotations

from itertools import groupby
from operator import attrgetter

import sqlalchemy.orm
from sqlalchemy import asc, desc

import app.db.taxon_name.constants
from app.db.author import model as author_model
from app.db.taxon_name import model
from app.db.taxon_rank.enums import RankAbbreviationVals

from ..citation import enums


def calculate_fields(
    mapper: sqlalchemy.orm.mapper,
    connection: sqlalchemy.orm.Session,
    target: model.TaxonName,
):
    target.canonical_name = map_canonical_name(target)
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
        target.editor = map_editors(target)


def map_canonical_name(
    target: model.TaxonName,
):
    vals = [target.uninomial, target.specific_epithet]
    if (
        target.kingdom
        and target.kingdom.kingdom_name
        == app.db.taxon_name.constants.PLANTAE_KINGDOM_NAME
    ):
        if target.taxon_rank.rank_abbrev:
            vals.append(RankAbbreviationVals[target.taxon_rank.rank_abbrev])
    vals.append(target.infraspecific_epithet)
    return " ".join(filter(None, vals))


def map_authors(
    mapper: sqlalchemy.orm.mapper,
    connection: sqlalchemy.orm.Session,
    target: model.TaxonName,
):
    citations = target.citations.filter_by(deleted=False)\
        .order_by(asc("author_type"))\
        .order_by(asc("author_order"))  # fmt: skip

    author_types = {
        k: list(g) for k, g in groupby(citations, attrgetter("author_type"))
    }

    if target.kingdom.kingdom_name == app.db.taxon_name.constants.ANIMAL_KINGDOM_NAME:
        if enums.AuthorType.basionym in author_types:
            val = stringify_citation_authors(author_types[enums.AuthorType.basionym])
            return f"({val}, {target.form_desc_yr})"
        elif enums.AuthorType.current in author_types:
            val = stringify_citation_authors(author_types[enums.AuthorType.current])
            return f"{val}, {target.form_desc_yr}"
    else:
        val = ""
        if enums.AuthorType.basionym in author_types:
            basionym_authors = stringify_citation_authors(
                author_types[enums.AuthorType.basionym]
            )
            val = f"({basionym_authors})"
        if enums.AuthorType.current in author_types:
            current_authors = stringify_citation_authors(
                author_types[enums.AuthorType.current]
            )
            val = " ".join(filter(None, [val, current_authors]))
        if val:
            return val

    return None


def stringify_citation_authors(authors: list[author_model.Author]):
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


def map_editors(target: model.TaxonName):
    citations = target.citations.filter_by(author_type="editor").order_by(
        asc("author_order")
    )

    if citations.count():
        return stringify_citation_authors(list(citations))

    return None


def map_vernacular(target: model.TaxonName):
    vernacular = (
        target.vernaculars.filter_by(deleted=False, preferred=True)
        .order_by(asc("sort_order"))
        .first()
    )
    if vernacular:
        return vernacular.vernacular_name
    return None


def map_vernaculars(target: model.TaxonName):
    vernaculars = target.vernaculars.filter_by(deleted=False).order_by(
        desc("preferred")
    )
    if vernaculars.count:
        return ", ".join(
            filter(
                None,
                [vernacular.vernacular_name for vernacular in vernaculars],
            )
        )
    return None
