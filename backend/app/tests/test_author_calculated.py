import datetime

from app.db.author.crud import AuthorCrud
from app.db.author.model import Author

TEST_DATA = [
    ("Surname", "Abbreviation.", "Initials Surname"),
    (None, "A.B.Cde", "A.B. Cde"),
    (None, "A.Cde", "A. Cde"),
    (None, "Cde", "Cde"),
    (None, "Cde.", "Cde."),
    (None, "A.B.Cde.", "A.B. Cde."),
    (None, "A.Cde.", "A. Cde."),
    (None, "A.B.  Cde", "A.B. Cde"),
    (None, "Abcd.e.", "Abcd. e."),
    (None, "A.B.C.Def.", "A.B.C. Def."),
    (None, "Abc.Def.Ghi.", "Abc.Def. Ghi."),
]

NOW = datetime.datetime.utcnow()

AUTHOR_FIELDS = {
    "initials": "Initials",
    "updated_by": None,
    "updated_on": None,
    "created_on": NOW,
}


def get_or_create_author(test_db, user_id, surname, abbreviation):
    author = AuthorCrud.get_by_property(test_db, "abbreviation", abbreviation)
    if not author:
        author = Author(
            **AUTHOR_FIELDS,
            surname=surname,
            abbreviation=abbreviation,
            created_by=user_id
        )
        test_db.add(author)
        test_db.commit()
    return author


def test_display_name(test_db, test_superuser):
    user_id = test_superuser.user_id
    for surname, abbreviation, display_name in TEST_DATA:
        author = get_or_create_author(test_db, user_id, surname, abbreviation)
        assert author.display_name == display_name
