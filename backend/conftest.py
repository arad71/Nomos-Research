import datetime
import typing as t

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, database_exists, drop_database

from app.core import config, security
from app.db.author.model import Author
from app.db.citation.model import Citation
from app.db.classification_system.model import ClassificationSystem
from app.db.cross_reference.model import CrossReference
from app.db.hierarchy.model import Hierarchy
from app.db.informal_group.model import InformalGroup
from app.db.kingdom.model import Kingdom
from app.db.publication.model import Publication
from app.db.role.constants import Role
from app.db.role.model import Role as RoleModel
from app.db.session import Base, get_db
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User
from app.db.user_role.model import UserRole as UserRoleModel
from app.db.vernacular.model import Vernacular
from app.main import app


def get_test_db_url() -> str:
    return f"{config.settings.SQLALCHEMY_DATABASE_URI}_test"


@pytest.fixture
def test_db():
    """
    Modify the db session to automatically roll back after each test.
    This is to avoid tests affecting the database state of other tests.
    """
    # Connect to the test database
    engine = create_engine(
        get_test_db_url(),
        pool_pre_ping=True,
    )

    connection = engine.connect()
    trans = connection.begin()

    # Run a parent transaction that can roll back all changes
    test_session_maker = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    test_session = test_session_maker()
    test_session.begin_nested()

    @event.listens_for(test_session, "after_transaction_end")
    def restart_savepoint(s, transaction):
        if transaction.nested and not transaction._parent.nested:
            s.expire_all()
            s.begin_nested()

    yield test_session

    # Roll back the parent transaction after the test is complete
    test_session.close()
    trans.rollback()
    connection.close()


@pytest.fixture(scope="session", autouse=True)
def create_test_db():
    """
    Create a test database and use it for the whole test session.
    """

    test_db_url = get_test_db_url()

    # Create the test database
    assert not database_exists(
        test_db_url
    ), "Test database already exists. Aborting tests."
    create_database(test_db_url)
    test_engine = create_engine(test_db_url)
    Base.metadata.create_all(test_engine)

    # Run the tests
    yield

    # Drop the test database
    drop_database(test_db_url)


@pytest.fixture
def client(test_db):
    """
    Get a TestClient instance that reads/write to the test database.
    """

    def get_test_db():
        yield test_db

    app.dependency_overrides[get_db] = get_test_db

    yield TestClient(app)


@pytest.fixture
def test_password() -> str:
    return "securepassword"


def get_password_hash() -> str:
    """
    Password hashing can be expensive so a mock will be much faster
    """
    return "supersecrethash"


@pytest.fixture
def test_user(test_db) -> User:
    """
    Make a test user in the database
    """

    user = User(
        email="fake@email.com",
        hashed_password=get_password_hash(),
        is_active=True,
    )
    test_db.add(user)
    test_db.commit()
    return user


@pytest.fixture
def test_superuser(test_db) -> User:
    """
    Superuser for testing
    """

    user = User(
        email="fakeadmin@email.com",
        hashed_password=get_password_hash(),
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    role = RoleModel(
        name=Role.SUPER_ADMIN["name"],
        description=Role.SUPER_ADMIN["description"]
    )

    test_db.add(role)
    test_db.commit()
    test_db.refresh(role)

    user_role = UserRoleModel(
       role_id=role.role_id,
       user_id=user.user_id
    )
    test_db.add(user_role)
    test_db.commit()
    return user


@pytest.fixture
def test_author(test_db, test_superuser) -> Author:
    """
    Author for testing
    """

    now = datetime.datetime.utcnow()
    author = Author(
        author = "Test Author",
        surname = "Author",
        first_names = "Test",
        initials = "TA",
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(author)
    test_db.commit()
    return author


@pytest.fixture
def test_citation(test_db, test_taxon_name, test_author, test_superuser) -> Citation:
    """
    Citation for testing
    """

    now = datetime.datetime.utcnow()
    citation = Citation(
        taxon_name_id = test_taxon_name.taxon_name_id,
        author_id = test_author.author_id,
        author_type = "current",
        author_order = 0,
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(citation)
    test_db.commit()
    return citation


@pytest.fixture
def test_classification_system(test_db, test_superuser) -> ClassificationSystem:
    """
    Classification System for testing
    """

    now = datetime.datetime.utcnow()
    classification_system = ClassificationSystem(
        class_desc = "CLASS_DESC",
        class_type = "informal",
        preferred = True,
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(classification_system)
    test_db.commit()
    return classification_system


@pytest.fixture
def test_cross_reference(test_db, test_taxon_name, test_superuser) -> CrossReference:
    """
    Cross Reference for testing
    """

    now = datetime.datetime.utcnow()
    cross_reference = CrossReference(
        old_name_id = test_taxon_name.taxon_name_id,
        cross_reference_type = "mis",
        active = True,
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(cross_reference)
    test_db.commit()
    return cross_reference


@pytest.fixture
def test_hierarchy(test_db, test_taxon_name, test_classification_system, test_taxon_name_2, test_superuser) -> Hierarchy:
    """
    Hierarchy for testing
    """

    now = datetime.datetime.utcnow()
    hierarchy = Hierarchy(
        taxon_name_id = test_taxon_name.taxon_name_id,
        classification_system_id = test_classification_system.classification_system_id,
        parent_nid = test_taxon_name_2.taxon_name_id,
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(hierarchy)
    test_db.commit()
    return hierarchy


@pytest.fixture
def test_informal_group(test_db, test_taxon_name, test_classification_system, test_superuser) -> InformalGroup:
    """
    Informal Group for testing
    """

    now = datetime.datetime.utcnow()
    informal_group = InformalGroup(
        taxon_name_id = test_taxon_name.taxon_name_id,
        classification_system_id = test_classification_system.classification_system_id,
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(informal_group)
    test_db.commit()
    return informal_group


@pytest.fixture
def test_kingdom(test_db, test_superuser) -> Kingdom:
    """
    Kingdom for testing
    """

    now = datetime.datetime.utcnow()
    kingdom = Kingdom(
        kingdom_name = "Kingdom1",
        kingdom_desc = "Kingdom Description",
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(kingdom)
    test_db.commit()
    return kingdom


@pytest.fixture
def test_publication(test_db, test_superuser) -> Publication:
    """
    Publication for testing
    """

    now = datetime.datetime.utcnow()
    publication = Publication(
        bad_publication = False,
        publication = "PUBLICATION",
        publication_name = "PUBLICATION_NAME",
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(publication)
    test_db.commit()
    return publication


@pytest.fixture
def test_taxon_name(test_db, test_kingdom, test_taxon_rank, test_publication, test_superuser) -> TaxonName:
    """
    Taxon Name for testing
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id = test_kingdom.kingdom_id,
        rank_id = test_taxon_rank.taxon_rank_id,
        rank_name = "Rank Name",
        is_current = True,
        validated = True,
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(taxon_name)
    test_db.commit()
    return taxon_name


@pytest.fixture
def test_taxon_name_2(test_db, test_kingdom, test_taxon_rank, test_publication, test_superuser) -> TaxonName:
    """
    Taxon Name 2 for testing
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id = test_kingdom.kingdom_id,
        rank_id = test_taxon_rank.taxon_rank_id,
        rank_name = "Rank Name 2",
        is_current = True,
        validated = True,
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(taxon_name)
    test_db.commit()
    return taxon_name


@pytest.fixture
def test_taxon_rank(test_db, test_kingdom, test_superuser) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    now = datetime.datetime.utcnow()
    taxon_rank = TaxonRank(
        kingdom_id = test_kingdom.kingdom_id,
        rank_name = "Rank Name 1",
        rank_abbrev = "subvar.",
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(taxon_rank)
    test_db.commit()
    return taxon_rank


@pytest.fixture
def test_vernacular(test_db, test_taxon_name, test_superuser) -> Vernacular:
    """
    Vernacular for testing
    """

    now = datetime.datetime.utcnow()
    vernacular = Vernacular(
        taxon_name_id = test_taxon_name.taxon_name_id,
        vernacular = "Vernacular 1",
        language = "english",
        enabled = True,
        updated_by = test_superuser.user_id,
        updated_on = now,
        created_by = test_superuser.user_id,
        created_on = now
    )
    test_db.add(vernacular)
    test_db.commit()
    return vernacular


def verify_password_mock(first: str, second: str) -> bool:
    return True


@pytest.fixture
def user_token_headers(
    client: TestClient, test_user, test_password, monkeypatch
) -> t.Dict[str, str]:
    monkeypatch.setattr(security, "verify_password", verify_password_mock)

    login_data = {
        "username": test_user.email,
        "password": test_password,
    }
    r = client.post("/api/token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers


@pytest.fixture
def superuser_token_headers(
    client: TestClient, test_superuser, test_password, monkeypatch
) -> t.Dict[str, str]:
    monkeypatch.setattr(security, "verify_password", verify_password_mock)

    login_data = {
        "username": test_superuser.email,
        "password": test_password,
    }
    r = client.post("/api/token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
