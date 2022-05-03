import csv
import datetime
import functools
import os

from app.db.author.crud import AuthorCrud
from app.db.author.model import Author
from app.db.citation.model import Citation
from app.db.kingdom.crud import KingdomCrud
from app.db.kingdom.model import Kingdom
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.model import TaxonRank

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
        filter(None, [row["author1"], row["author2"], row["author3"]]),
    )
    authors = [author for author in author_map]
    author_types = filter(
        None, [row["author_type1"], row["author_type2"], row["author_type3"]]
    )
    return [author_tuple for author_tuple in zip(authors, author_types)]


def get_kingdom(test_db, kingdom_name, user_id):
    kingdom = KingdomCrud.get_by_property(test_db, "kingdom_name", kingdom_name)
    if not kingdom:
        kingdom = Kingdom(
            kingdom_name="Kingdom1",
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
        specific_epithet=row["specific_epithet"],
        infraspecific_epithet=row["infraspecific_epithet"],
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
    taxon_rank = TaxonRank(
        kingdom_id=kingdom_id,
        rank_name=row["rank_name"],
        rank_abbrev=row["rank_abbrev"] if row["rank_abbrev"] else None,
        uninomial=False if row["rank_uninomial"] == "false" else True,
        updated_by=user_id,
        updated_on=NOW,
        created_by=user_id,
        created_on=NOW,
    )
    test_db.add(taxon_rank)
    test_db.commit()
    return taxon_rank


def test_canonical_name(capsys, test_db, test_superuser):
    path = os.getcwd() + f"/app/tests/taxon_test_data.csv"
    with open(path, mode="r", encoding="iso-8859-1") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            with capsys.disabled():
                print(row["scientific_name"])
            user_id = test_superuser.user_id
            kingdom = get_kingdom(test_db, row["kingdom_name"], user_id)
            taxon_rank = create_taxon_rank(test_db, row, kingdom.kingdom_id, user_id)
            taxon_name = create_taxon_name(test_db, row, kingdom, taxon_rank, user_id)
            authors = get_authors(test_db, row, user_id)
            create_citations(test_db, authors, taxon_name, user_id)
            assert row["canonical_name"] == taxon_name.canonical_name
            assert row["scientific_name"] == taxon_name.scientific_name
            assert row["author"] == taxon_name.author
            assert (
                row["formatted_scientific_name"] == taxon_name.formatted_scientific_name
            )
