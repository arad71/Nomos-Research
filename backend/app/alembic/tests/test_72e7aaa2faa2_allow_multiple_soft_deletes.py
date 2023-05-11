import pytest
from conftest import get_password_hash
from sqlalchemy.exc import IntegrityError

from app.db.author.crud import AuthorCrud
from app.db.author.model import Author
from app.db.user.crud import UserCrud
from app.db.user.model import User


def test_multiple_soft_deletes(test_db, test_superuser, test_author):
    """
    This test is intended to confirm that uniqueness of data entries is confined only
    to active records. Records that have been soft deleted can have duplicates, and
    new active records can be created while duplicate soft deleted records exist.
    """
    # setup test parameters
    abbreviation = "TestSoftDelete"
    active_filter_conditions = f'{{"abbreviation":"{abbreviation}"}}'
    deleted_filter_conditions = f'{{"abbreviation":"{abbreviation}", "deleted": true}}'
    new_author1 = Author(abbreviation=abbreviation, surname="1st to be deleted")
    new_author2 = Author(abbreviation=abbreviation, surname="2nd to be deleted")
    new_author3 = Author(abbreviation=abbreviation, surname="to stay active")
    new_author4 = Author(abbreviation=abbreviation, surname="to fail db entry")

    # confirm test entry does not exist
    query_empty, _ = AuthorCrud.get_items(
        test_db, test_superuser, list_filter=active_filter_conditions
    )
    assert len(query_empty) == 0
    query_also_empty, _ = AuthorCrud.get_items(
        test_db, test_superuser, list_filter=deleted_filter_conditions
    )
    assert len(query_also_empty) == 0

    # add first occurrence entry and validate
    test_db.add(new_author1)
    test_db.commit()
    query_first_author, _ = AuthorCrud.get_items(
        test_db, test_superuser, list_filter=active_filter_conditions
    )
    assert len(query_first_author) == 1

    # delete first occurrence and validate
    query_first_author[0].deleted = True
    test_db.commit()
    query_deleted_author, _ = AuthorCrud.get_items(
        test_db, test_superuser, list_filter=deleted_filter_conditions
    )
    assert len(query_deleted_author) == 1

    # add second occurrence and validate
    test_db.add(new_author2)
    test_db.commit()
    query_2nd_author, _ = AuthorCrud.get_items(
        test_db, test_superuser, list_filter=active_filter_conditions
    )
    assert len(query_2nd_author) == 1

    # delete second occurrence and validate
    query_2nd_author[0].deleted = True
    test_db.commit()
    query_two_deleted_authors, _ = AuthorCrud.get_items(
        test_db, test_superuser, list_filter=deleted_filter_conditions
    )
    assert len(query_two_deleted_authors) == 2

    # add third occurrence, attempt to add fourth occurrence as duplicate active entry
    # and validate entry failure
    test_db.add(new_author3)
    test_db.commit()
    test_db.add(new_author4)
    with pytest.raises(IntegrityError):
        test_db.commit()


def test_soft_deleted_user_login(test_db):
    """
    This test confirms that the backend get_user logic used for login actions does not
    break with multiple entries of the same user email where only one entry is active.
    """
    # Add a single soft deleted user and confirm the 'get' method doesn't select it
    user_email = f"softdeleted@email.com"
    user = User(
        email=user_email,
        hashed_password=get_password_hash(),
        first_name="deleted",
        deleted=True,
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    confirm_none = UserCrud.get_user_by_email(test_db, user_email)
    assert confirm_none == None

    # Add a second active user and confirm the 'get' method selects it
    user2 = User(
        email=user_email,
        hashed_password=get_password_hash(),
        first_name="active",
        deleted=False,
    )
    test_db.add(user2)
    test_db.commit()
    test_db.refresh(user2)
    confirm_one = UserCrud.get_user_by_email(test_db, user_email)
    assert confirm_one.first_name == user2.first_name
