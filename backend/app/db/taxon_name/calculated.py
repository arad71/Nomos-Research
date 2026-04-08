from __future__ import annotations

import re
from itertools import groupby
from operator import attrgetter
from typing import Optional

import sqlalchemy.orm
from sqlalchemy import asc, desc

import app.db.taxon_name.constants as constants
import app.db.taxon_name.schema as schema
from app.db.author import model as author_model
from app.db.citation.enums import AuthorType
from app.db.taxon_name import model
from app.db.taxon_name.enums import HybridCategory
from app.db.taxon_rank.enums import RankAbbreviationVals

from ..citation import enums


HYBRID_FORMULA_PREFIX_RE = re.compile(r"^(?:×|x|X)\s+")


def calculate_fields(
    mapper: sqlalchemy.orm.mapper,
    connection: sqlalchemy.orm.Session,
    target: model.TaxonName,
):
    """Calculate various fields for the given TaxonName. Used in SQLAlchemy events
    relating to the TaxonName records

    Args:
        mapper: The SQLAlchemy mapper.
        connection: The SQLAlchemy session connection.
        target: The TaxonName object to calculate fields for.
    """
    # If we don't have an ID yet, we cannot have relationships
    if hasattr(target, "taxon_name_id") and target.taxon_name_id:
        target.author = map_authors(target)
        target.vernacular = map_vernacular(target)
        target.all_vernaculars = map_vernaculars(target)
        target.editor = map_editors(target)
        # target.cons_code = map_cons_code(target)
        # target.cons_codes = map_cons_codes(target)
    if target.calculate_name:
        calculate_name_fields(target)


def calculate_name_fields(target: model.TaxonName):
    """Calculate the name fields for a given TaxonName object.

    Args:
        target: The TaxonName object for which to calculate the name fields.

    The name fields include the canonical name, the canonical name without rank, the
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
    canonical_parts = get_name_components(target)
    target.canonical_name = calculate_canonical_name_string(canonical_parts)
    target.canonical_name_without_rank = calculate_canonical_name_string(
        canonical_parts,
        include_rank=False,
    )
    if any([target.canonical_name, target.author]):
        target.scientific_name = calculate_scientific_name_string(
            components=canonical_parts, is_autonym=target.is_autonym, italicize=False
        )
        target.formatted_scientific_name = calculate_scientific_name_string(
            components=canonical_parts, is_autonym=target.is_autonym, italicize=True
        )


def calculate_scientific_name_string(
    components: schema.NameStringComponents,
    is_autonym: bool = False,
    italicize: bool = True,
) -> str:
    """Calculates the formatted scientific name of a taxon.

    Wraps the string in italics for presentation in the frontend if necessary

    Args:
        components (schema.NameStringComponents):
            A dictionary containing the components of the taxon name.
        is_autonym (Boolean, optional):
            A flag indicating whether the taxon is an autonym. Default is False.
        italicize (Boolean, optional):
            A flag indicating whether the name should be italicized. Default is True.

    Returns:
        str: The formatted scientific name of the taxon.
    """
    if not isinstance(components, schema.NameStringComponents):
        raise TypeError("components must be an instance of NameStringComponents")
    parts = []
    uninomial = format_uninomial_for_display(
        components.uninomial,
        is_hybrid_formula=(
            components.is_hybrid_formula
            and not components.hybrid_marker_on_specific_epithet
        ),
        italicize=italicize,
    )
    if uninomial:
        parts.append(uninomial)
    specific_epithet = format_specific_epithet_for_display(
        components.specific_epithet,
        hybrid_marker_on_specific_epithet=components.hybrid_marker_on_specific_epithet,
        italicize=italicize,
    )
    if specific_epithet:
        parts.append(specific_epithet)
    infraspecific_epithet = (
        italicize_name(components.infraspecific_epithet)
        if italicize
        else components.infraspecific_epithet
    )
    if is_autonym:
        parts.append(components.author)
        parts.append(components.rank_abbreviation)
        parts.append(infraspecific_epithet)
    else:
        parts.append(components.rank_abbreviation)
        parts.append(infraspecific_epithet)
        parts.append(components.author)

    return filter_join(parts)


def italicize_name(name: str) -> str | None:
    """Italicizes the name if it is not None or empty.

    Args:
        name: The name to italicize.

    Returns:
        An html string with the italicized name, or None if the name is None or empty.
    """
    return f"<i>{name}</i>" if is_not_none_or_empty(name) else None


def get_name_components(
    target: model.TaxonName, include_rank: bool = True
) -> schema.NameStringComponents:
    """Generates the components of a string representation of a TaxonName object.

    Args:
        target: The target TaxonName object.
        include_rank: Whether to include the rank abbreviation in the canonical name
        (default: True).

    Returns:
        The canonical name of the TaxonName object as a dictionary of name fields.

    This method generates the canonical name based on the elements of the TaxonName
    object, such as the uninomial, specific epithet, and infraspecific epithet. If
    include_rank is set to True, the method will also include the rank abbreviation in
    the canonical name for TaxonName objects in the Plantae or Fungi kingdoms.
    """
    vals = schema.NameStringComponents()
    vals.uninomial = strip_hybrid_formula_prefix(target.uninomial)
    vals.specific_epithet = target.specific_epithet
    if include_rank and target.kingdom_name in (
        constants.PLANTAE_KINGDOM_NAME,
        constants.FUNGI_KINGDOM_NAME,
    ):
        if target.taxon_rank.rank_abbrev:
            vals.rank_abbreviation = RankAbbreviationVals[target.taxon_rank.rank_abbrev]
    vals.infraspecific_epithet = target.infraspecific_epithet
    vals.author = target.author
    hybrid_category_value = getattr(getattr(target, "hybrid_category", None), "value", None)
    vals.is_hybrid_formula = (
        bool(getattr(target, "is_hybrid", False))
        and hybrid_category_value == HybridCategory.hybrid_formula.value
    )
    return vals


def strip_hybrid_formula_prefix(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    if not normalized:
        return None
    normalized = HYBRID_FORMULA_PREFIX_RE.sub("", normalized, count=1).strip()
    return normalized or None


def format_uninomial_for_display(
    uninomial: str | None,
    *,
    is_hybrid_formula: bool = False,
    italicize: bool = False,
) -> str | None:
    normalized_uninomial = strip_hybrid_formula_prefix(uninomial)
    if not normalized_uninomial:
        return None
    display_value = italicize_name(normalized_uninomial) if italicize else normalized_uninomial
    if is_hybrid_formula:
        return f"× {display_value}"
    return display_value


def format_specific_epithet_for_display(
    specific_epithet: str | None,
    *,
    hybrid_marker_on_specific_epithet: bool = False,
    italicize: bool = False,
) -> str | None:
    normalized_specific_epithet = (
        strip_hybrid_formula_prefix(specific_epithet)
        if hybrid_marker_on_specific_epithet
        else specific_epithet
    )
    if not normalized_specific_epithet:
        return None
    display_value = (
        italicize_name(normalized_specific_epithet)
        if italicize
        else normalized_specific_epithet
    )
    if hybrid_marker_on_specific_epithet:
        return f"×{display_value}"
    return display_value


def calculate_canonical_name_string(
    components: schema.NameStringComponents,
    *,
    include_rank: bool = True,
) -> str | None:
    return filter_join(
        [
            format_uninomial_for_display(
                components.uninomial,
                is_hybrid_formula=(
                    components.is_hybrid_formula
                    and not components.hybrid_marker_on_specific_epithet
                ),
                italicize=False,
            ),
            format_specific_epithet_for_display(
                components.specific_epithet,
                hybrid_marker_on_specific_epithet=components.hybrid_marker_on_specific_epithet,
                italicize=False,
            ),
            components.rank_abbreviation if include_rank else None,
            components.infraspecific_epithet,
        ]
    )


def map_authors(
    target: model.TaxonName,
):
    """Maps the authors associated with a taxon.

    Args:
        target: A TaxonName object representing the taxon for which authors are to be
        mapped.

    Returns:
        None if no authors are found for the taxon, otherwise a string representation
        of the mapped authors.

    This method maps the authors associated with the taxon by retrieving citations,
    filtering out deleted ones, and grouping them by author type. It then constructs
    a formatted string containing the authors and the form description year of the
    taxon. If the taxon doesn't belong to the animal kingdom, it returns a string of
    basionym and current authors if any, or None if there are no authors.
    """
    citations = target.citations.filter_by(deleted=False) \
        .order_by(asc("author_type")) \
        .order_by(asc("author_order"))  # fmt: skip

    author_types = {
        k: list(g) for k, g in groupby(citations, attrgetter("author_type"))
    }

    if target.kingdom.kingdom_name == constants.ANIMAL_KINGDOM_NAME:
        # Animal Names
        if enums.AuthorType.basionym in author_types:
            val = stringify_citation_authors(author_types[enums.AuthorType.basionym])
            return f"({val}, {target.form_desc_yr})"
        elif enums.AuthorType.current in author_types:
            val = stringify_citation_authors(author_types[enums.AuthorType.current])
            return f"{val}, {target.form_desc_yr}"
    else:
        # Non-Animal Names
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
            val = filter_join([val, current_authors])
        if val:
            return val
    return None


def stringify_citation_authors(authors: list[author_model.Author]):
    """Convert a list of Author objects to a string representation of authors for
    citation.

    Args:
        authors: A list of Author objects.

    Returns:
        A string representation of authors for citation.
    """
    if not authors:
        return ""

    last = authors.pop()
    return filter_join(
        [
            filter_join([k.author.abbreviation for k in authors], ", "),
            last.author.abbreviation,
        ],
        " & ",
    )


def map_editors(target: model.TaxonName):
    """Maps the editors of the given taxon name.

    Args:
        target: The taxon name object.

    Returns:
        String representation of the citation authors who are editors. If no editors are
        found, it returns None.
    """
    citations = target.citations.filter_by(author_type=AuthorType.editor).order_by(
        asc("author_order")
    )

    if citations.count():
        return stringify_citation_authors(list(citations))

    return None


def map_vernacular(target: model.TaxonName):
    """Maps a vernacular name associated with a TaxonName object.

    Args:
        target: The taxon name for which the vernacular name needs to be mapped.

    Returns:
        The vernacular name if found, None otherwise.
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
    """Maps and retrieves vernacular names associated with a given TaxonName object.

    Args:
        target: The TaxonName object for which to retrieve vernacular names.

    Returns:
        A comma-separated string of vernacular names associated with the
        TaxonName object. Returns None if no vernacular names are found.
    """
    vernaculars = target.vernaculars.filter_by(deleted=False).order_by(
        desc("preferred")
    )
    if vernaculars.count:
        return filter_join(
            [vernacular.vernacular_name for vernacular in vernaculars], ", "
        )
    return None


def filter_join(parts: list[str | None] = None, delimiter: str = " "):
    """Joins the non-empty elements of the given list with the specified delimiter.

    Args:
        parts: A list of strings or None values to be joined.
        delimiter: The delimiter to use for joining the elements.

    Returns:
        A string obtained by joining the non-empty elements of parts with delimiter.
    """
    if parts is None:
        parts = []
    return delimiter.join(
        filter(
            is_not_none_or_empty,
            parts,
        )
    )


def is_not_none_or_empty(s: Optional[str]) -> bool:
    """Check whether a string is not None or empty.

    Args:
        s: Input string.

    Returns:
        Boolean indicating whether the string is not None or empty.
    """
    return s is not None and s != ""


# def map_cons_code(target):
#     cons_code = (
#         target.conservation_code.filter_by(deleted=False, preferred=True)
#         .order_by(asc("sort_order"))
#         .first()
#     )
#     if cons_code:
#         return cons_code.source + ":" + cons_code.cons_code
#     return None


# def map_cons_codes(target):
#     cons_codes = target.conservation_code.filter_by(deleted=False).order_by(
#         desc("preferred")
#     )
#     if cons_codes.count:
#         return ", ".join(
#             filter(
#                 None,
#                 [
#                     cons_code.source + ":" + cons_code.cons_code
#                     for cons_code in cons_codes
#                 ],
#             )
#         )
#     return None
