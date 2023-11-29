from __future__ import annotations

from itertools import groupby
from operator import attrgetter

import sqlalchemy.orm
from sqlalchemy import asc, desc

import app.db.taxon_name.constants as constants
from app.db.author import model as author_model
from app.db.taxon_name import model
from app.db.taxon_rank.enums import RankAbbreviationVals

from ..citation import enums


def calculate_fields(
    mapper: sqlalchemy.orm.mapper,
    connection: sqlalchemy.orm.Session,
    target: model.TaxonName,
):
    """
    Calculate various fields for the given TaxonName. Used in SQLAlchemy events
    relating to the TaxonName records

    :param mapper: The SQLAlchemy mapper.
    :param connection: The SQLAlchemy session connection.
    :param target: The TaxonName object to calculate fields for.
    :return: None
    """
    # If we don't have an ID yet, we cannot have relationships
    if hasattr(target, "taxon_name_id") and target.taxon_name_id:
        target.author = map_authors(target)
        target.vernacular = map_vernacular(target)
        target.all_vernaculars = map_vernaculars(target)
        target.editor = map_editors(target)
    if target.calculate_name:
        calculate_name_fields(target)


def calculate_name_fields(target: model.TaxonName):
    """
    :param target: The TaxonName object for which to calculate the name fields.
    :return: None

    This method calculates and sets the name fields for a given TaxonName object. The
    name fields include the canonical name, the canonical name without rank, the
    scientific name, and the formatted scientific name.

    The method first calculates the canonical name and canonical name without rank using
    the helper function map_canonical_name(). The boolean parameter determines whether
    the rank is included in the canonical name.

    If either the canonical name or the author is present, the scientific name is
    constructed by joining the canonical name and the author using a space separator.

    The formatted scientific name is calculated using the
    calculate_formatted_scientific_name() function, which takes the canonical name
    and the author as parameters.
    """
    target.canonical_name = map_canonical_name(target)
    target.canonical_name_without_rank = map_canonical_name(target, False)
    if any([target.canonical_name, target.author]):
        target.scientific_name = " ".join(
            filter(None, [target.canonical_name, target.author])
        )
        target.formatted_scientific_name = calculate_formatted_scientific_name(
            target.canonical_name, target.author
        )


def calculate_formatted_scientific_name(canonical_name: str, author: str) -> str:
    """
    Calculate the formatted scientific name.

    :param canonical_name: The canonical name of the taxon.
    :param author: The author of the taxon.
    :return: The formatted scientific name.
    """
    return " ".join(
        filter(
            None,
            [
                f"<i class='canonical-name'>{canonical_name}</i>",
                author,
            ],
        )
    )


def map_canonical_name(target: model.TaxonName, include_rank: bool = True):
    """
    :param target: The target TaxonName object
    :param include_rank: Whether to include the rank abbreviation in the canonical name
    (default: True)
    :return: The canonical name of the TaxonName object as a string

    This method takes a TaxonName object and generates its canonical name. The canonical
     name is generated based on the elements of the TaxonName object, such as the
      uninomial, specific epithet, and infraspecific epithet.

    If include_rank is set to True, the method will also include the rank abbreviation
    in the canonical name. This is applicable only for TaxonName objects belonging to
    the Plantae and Fungi kingdoms.

    The generated canonical name is returned as a string.
    """
    vals = [target.uninomial, target.specific_epithet]
    if include_rank and target.kingdom_name in (
        constants.PLANTAE_KINGDOM_NAME,
        constants.FUNGI_KINGDOM_NAME,
    ):
        if target.taxon_rank.rank_abbrev:
            vals.append(RankAbbreviationVals[target.taxon_rank.rank_abbrev])
    vals.append(target.infraspecific_epithet)
    return " ".join(filter(None, vals))


def map_authors(
    target: model.TaxonName,
):
    """
    :param target: A TaxonName object representing the taxon for which authors are to be
     mapped.
    :return: None if no authors are found for the taxon, otherwise a string
    representation of the mapped authors.

    This method takes a TaxonName object as input and maps the authors associated with
    the taxon. It retrieves the citations associated with the taxon, filters out the
    deleted ones, and orders them by author type and author order. It then groups the
    citations by author type using the groupby function from itertools.

    If the taxon belongs to the animal kingdom, it checks if there are authors
    associated with the basionym author type. If there are, it calls the
    stringify_citation_authors function to get a string representation of the basionym
    authors, and returns a formatted string containing the basionym authors and the form
    description year of the taxon.

    If there are no basionym authors, it checks if there are authors associated with the
     current author type. If there are, it calls the stringify_citation_authors function
     to get a string representation of the current authors, and returns a formatted
     string containing the current authors and the form description year of the taxon.

    If the taxon does not belong to the animal kingdom, it initializes an empty string
    variable called val. It then checks if there are authors associated with the
    basionym author type. If there are, it calls the stringify_citation_authors function
     to get a string representation of the basionym authors, and adds it to the val
     variable.

    It then checks if there are authors associated with the current author type. If
    there are, it calls the stringify_citation_authors function to get a string
    representation of the current authors, and adds it to the val variable.

    Finally, it checks if the val variable is not empty. If it is not empty, it returns
    the val variable. Otherwise, it returns None.
    """
    citations = target.citations.filter_by(deleted=False)\
        .order_by(asc("author_type"))\
        .order_by(asc("author_order"))  # fmt: skip

    author_types = {
        k: list(g) for k, g in groupby(citations, attrgetter("author_type"))
    }

    if target.kingdom.kingdom_name == constants.ANIMAL_KINGDOM_NAME:
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
    """
    Convert a list of Author objects to a string representation of authors for citation.

    :param authors: A list of Author objects.
    :return: A string representation of authors for citation.
    """
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
    """
    Maps the editors of the given taxon name.

    :param target: The taxon name object.
    :return: String representation of the citation authors who are editors.
    """
    citations = target.citations.filter_by(author_type="editor").order_by(
        asc("author_order")
    )

    if citations.count():
        return stringify_citation_authors(list(citations))

    return None


def map_vernacular(target: model.TaxonName):
    """
    This method, `map_vernacular`, takes in a `target` parameter of type
    `model.TaxonName` and returns a vernacular name associated with the target taxon
     name.

    :param target: The taxon name for which the vernacular name needs to be mapped.
    :return: The vernacular name if found, None otherwise.
    """
    vernacular = (
        target.vernaculars.filter_by(deleted=False, preferred=True)
        .order_by(asc("sort_order"))
        .first()
    )
    if vernacular:
        return vernacular.vernacular_name
    return None


def map_vernaculars(target: model.TaxonName):
    """
    Maps and retrieves vernacular names associated with a given TaxonName object.

    :param target: The TaxonName object for which to retrieve vernacular names.
    :return: A comma-separated string of vernacular names associated with the TaxonName
    object. Returns None if no vernacular names are found.

    Example usage:
        target = model.TaxonName(...)
        vernaculars = map_vernaculars(target)
        if vernaculars:
            print(vernaculars)
        else:
            print("No vernacular names found.")
    """
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
