import datetime

from app.db.author.crud import AuthorCrud
from app.db.author.model import Author

TEST_DATA = [
    ("Initials", "Surname", "Abbreviation.", "Initials Surname"),
    (None, None, "A.B.Cde", "A.B. Cde"),
    (None, None, "A.Cde", "A. Cde"),
    (None, None, "Cde", "Cde"),
    (None, None, "Cde.", "Cde."),
    (None, None, "A.B.Cde.", "A.B. Cde."),
    (None, None, "A.Cde.", "A. Cde."),
    (None, None, "A.B.  Cde", "A.B. Cde"),
    (None, None, "Abcd.e.", "Abcd. e."),
    (None, None, "A.B.C.Def.", "A.B.C. Def."),
    (None, None, "Abc.Def.Ghi.", "Abc.Def. Ghi."),
    ("A.B.", "Cde.", "abc", "A.B. Cde."),
    ("A.B. ", "Cde.", "abcd", "A.B. Cde."),
    ("A.B.", " Cde.", "abcdef", "A.B. Cde."),
    (None, "Cde.", "abcdefg", "abcdefg"),
    ("A.B.", None, "abcdefgh", "abcdefgh"),
    (None, None, "A B C", "A B C"),
    (None, None, "A. B. C.", "A.B. C.")
]

NOW = datetime.datetime.utcnow()

AUTHOR_FIELDS = {
    "updated_by": None,
    "updated_on": None,
    "created_on": NOW,
}


def get_or_create_author(test_db, user_id, initials, surname, abbreviation):
    author = AuthorCrud.get_by_property(test_db, "abbreviation", abbreviation)
    if not author:
        author = Author(
            **AUTHOR_FIELDS,
            surname=surname,
            abbreviation=abbreviation,
            created_by=user_id,
            initials=initials
        )
        test_db.add(author)
        test_db.commit()
    return author


def test_display_name(test_db, test_superuser):
    user_id = test_superuser.user_id
    for initials, surname, abbreviation, display_name in TEST_DATA:
        author = get_or_create_author(test_db, user_id, initials, surname, abbreviation)
        assert author.display_name == display_name
