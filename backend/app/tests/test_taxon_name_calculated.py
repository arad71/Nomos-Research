import csv
import datetime
import functools
import os

import pytest
from sqlalchemy import orm

from app.db.author.crud import AuthorCrud
from app.db.author.model import Author
from app.db.citation.model import Citation
from app.db.kingdom.crud import KingdomCrud
from app.db.kingdom.model import Kingdom
from app.db.taxon_name import schema
from app.db.taxon_name.calculated import (
    append_cultivar_epithet_to_name,
    calculate_canonical_name_string,
    calculate_scientific_name_string,
)
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User

NOW = datetime.datetime.utcnow()
AUTHOR_FIELDS = {
    "surname": "SURNAME_TEST",
    "first_names": "FIRSTNAMES_TEST",
    "initials": "INITIALS_TEST",
    "updated_by": None,
    "updated_on": None,
    "created_on": NOW,
}


def get_or_create_author(test_db, user_id, abbreviation):
    author = AuthorCrud.get_by_property(test_db, "abbreviation", abbreviation)
    if not author:
        author = Author(**AUTHOR_FIELDS, abbreviation=abbreviation, created_by=user_id)
        test_db.add(author)
        test_db.commit()
    return author


def get_authors(test_db, row, user_id) -> [(Author, str)]:
    author_map = map(
        functools.partial(get_or_create_author, test_db, user_id),
        filter(
            None,
            [
                row["author1"],
                row["author2"],
                row["author3"],
                row["author4"],
                row["author5"],
            ],
        ),
    )
    authors = [author for author in author_map]
    author_types = filter(
        None,
        [
            row["author_1_type"],
            row["author_2_type"],
            row["author_3_type"],
            row["author_4_type"],
            row["author_5_type"],
        ],
    )
    return [author_tuple for author_tuple in zip(authors, author_types)]


def get_kingdom(test_db, kingdom_name, user_id):
    kingdom = KingdomCrud.get_by_property(test_db, "kingdom_name", kingdom_name)
    if not kingdom:
        kingdom = Kingdom(
            kingdom_name=kingdom_name,
            kingdom_desc="Kingdom Description",
            updated_by=None,
            updated_on=None,
            created_by=user_id,
            created_on=NOW,
        )
        test_db.add(kingdom)
        test_db.commit()
    return kingdom


def create_taxon_name(test_db, row, kingdom, taxon_rank, user_id):
    taxon_name = TaxonName(
        kingdom_id=kingdom.kingdom_id,
        rank_id=taxon_rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial=row["uninomial"] or None,
        specific_epithet=row["specific_epithet"] or None,
        infraspecific_epithet=row["infraspecific_epithet"] or None,
        form_desc_yr=row["form_desc_yr"] or None,
        is_autonym=row["is_autonym"].lower() == "true",
        updated_by=None,
        updated_on=None,
        created_by=user_id,
        created_on=NOW,
    )
    test_db.add(taxon_name)
    test_db.commit()
    return taxon_name


def create_citation(test_db, taxon_name, user_id, author_tuple):
    author = author_tuple[0]
    author_type = author_tuple[1]
    citation = Citation(
        taxon_name_id=taxon_name.taxon_name_id,
        author_id=author.author_id,
        author_type=author_type,
        author_order=0,
        updated_by=None,
        updated_on=None,
        created_by=user_id,
        created_on=NOW,
    )
    test_db.add(citation)
    test_db.commit()
    return citation


def create_citations(test_db, authors, taxon_name, user_id):
    citations = map(
        functools.partial(create_citation, test_db, taxon_name, user_id), authors
    )
    return [citation for citation in citations]


def create_taxon_rank(test_db, row, kingdom_id, user_id):
    taxon_rank = (
        test_db.query(TaxonRank)
        .filter(
            TaxonRank.kingdom_id == kingdom_id, TaxonRank.rank_name == row["rank_name"]
        )
        .one_or_none()
    )
    if not taxon_rank:
        taxon_rank = TaxonRank(
            kingdom_id=kingdom_id,
            rank_name=row["rank_name"],
            rank_abbrev=row["rank_abbrev"] or None,
            uninomial=False,
            updated_by=None,
            updated_on=None,
            created_by=user_id,
            created_on=NOW,
        )
        test_db.add(taxon_rank)
        test_db.commit()
    return taxon_rank


def update_taxon_name(test_db, taxon_name, user_id):
    taxon_name.updated_by = user_id
    taxon_name.updated_on = NOW
    test_db.add(taxon_name)
    test_db.commit()


# A helper function to read the csv data
def get_data():
    path = os.getcwd() + f"/app/tests/taxon_name_test_data.csv"
    with open(path, mode="r", encoding="utf-8") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        return [row for row in csv_reader]


# Use pytest.mark.parametrize to feed the data to test function
@pytest.mark.parametrize("row", get_data())
def test_calculated_fields(test_db: orm.Session, test_superuser: User, row: dict):
    user_id = test_superuser.user_id
    kingdom = get_kingdom(test_db, row["kingdom_name"], user_id)
    taxon_rank = create_taxon_rank(test_db, row, kingdom.kingdom_id, user_id)
    taxon_name = create_taxon_name(test_db, row, kingdom, taxon_rank, user_id)
    authors = get_authors(test_db, row, user_id)
    create_citations(test_db, authors, taxon_name, user_id)
    update_taxon_name(test_db, taxon_name, user_id)
    author = row["author"] or None
    assert taxon_name.author == author
    editor = row["editor"] or None
    assert taxon_name.editor == editor
    assert taxon_name.canonical_name == row["canonical_name"]
    assert taxon_name.canonical_name_without_rank == row["canonical_name_without_rank"]
    assert taxon_name.scientific_name == row["scientific_name"]
    assert taxon_name.formatted_scientific_name == row["formatted_scientific_name"]


def test_calculate_formatted_scientific_name():
    assert (
        calculate_scientific_name_string(
            schema.NameStringComponents(
                uninomial="Mus", specific_epithet="musculus", author="Linnaeus, 1758"
            )
        )
        == "<i>Mus</i> <i>musculus</i> Linnaeus, 1758"
    )
    assert (
        calculate_scientific_name_string(
            schema.NameStringComponents(
                uninomial="Felis", specific_epithet="catus", author=""
            )
        )
        == "<i>Felis</i> <i>catus</i>"
    )

    # testing with None author
    assert (
        calculate_scientific_name_string(
            schema.NameStringComponents(
                uninomial="Canis", specific_epithet="lupus", author=None
            )
        )
        == "<i>Canis</i> <i>lupus</i>"
    )

    # testing with None name
    with pytest.raises(TypeError) as exec_info:
        calculate_scientific_name_string(None)  # noqa testing that an error is thrown
        assert (
            str(exec_info.value)
            == "components must be an instance of NameStringComponents"
        )

    autonym = schema.NameStringComponents()
    autonym.uninomial = "Poa"
    autonym.specific_epithet = "annua"
    autonym.author = "L."
    autonym.rank_abbreviation = "subsp."
    autonym.infraspecific_epithet = "annua"
    assert (
        calculate_scientific_name_string(autonym, is_autonym=True, italicize=False)
        == "Poa annua L. subsp. annua"
    )
    assert (
        calculate_scientific_name_string(autonym, is_autonym=False, italicize=False)
        == "Poa annua subsp. annua L."
    )
    assert (
        calculate_scientific_name_string(autonym, is_autonym=True)
        == "<i>Poa</i> <i>annua</i> L. subsp. <i>annua</i>"  # noqa: E501
    )
    assert (
        calculate_scientific_name_string(autonym, is_autonym=False)
        == "<i>Poa</i> <i>annua</i> subsp. <i>annua</i> L."  # noqa: E501
    )


def test_calculate_names_with_cultivar_epithet():
    cultivar = schema.NameStringComponents(
        uninomial="Lomandra",
        specific_epithet="confertifolia",
        rank_abbreviation="subsp.",
        infraspecific_epithet="rubiginosa",
        cultivar_epithet="merlom ruby",
    )

    assert (
        calculate_canonical_name_string(cultivar)
        == "Lomandra confertifolia subsp. rubiginosa \u2018Merlom Ruby\u2019"
    )
    assert (
        calculate_canonical_name_string(cultivar, include_rank=False)
        == "Lomandra confertifolia rubiginosa \u2018Merlom Ruby\u2019"
    )
    assert (
        calculate_scientific_name_string(cultivar, italicize=False)
        == "Lomandra confertifolia subsp. rubiginosa \u2018Merlom Ruby\u2019"
    )
    assert (
        calculate_scientific_name_string(cultivar, italicize=True)
        == "<i>Lomandra</i> <i>confertifolia</i> subsp. "
        "<i>rubiginosa</i> \u2018Merlom Ruby\u2019"
    )


def test_append_cultivar_epithet_to_stored_name_is_idempotent():
    assert (
        append_cultivar_epithet_to_name(
            "Sargassum ilicifolium var. oocystoides Grunow",
            "golden form",
        )
        == "Sargassum ilicifolium var. oocystoides Grunow \u2018Golden Form\u2019"
    )
    assert (
        append_cultivar_epithet_to_name(
            "Sargassum ilicifolium var. oocystoides Grunow \u2018Golden Form\u2019",
            "golden form",
        )
        == "Sargassum ilicifolium var. oocystoides Grunow \u2018Golden Form\u2019"
    )
