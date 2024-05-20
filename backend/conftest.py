import datetime
import typing as t

import loguru
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy_utils import create_database, database_exists, drop_database

from app.core import config, security
from app.db.author.model import Author
from app.db.citation.model import Citation
from app.db.classification_system.model import ClassificationSystem
from app.db.conscode_taxon.model import Conscodetaxon
from app.db.conservation_code.model import Conservationcode
from app.db.cross_reference.model import CrossReference
from app.db.hierarchy.model import Hierarchy
from app.db.informal_group.model import InformalGroup
from app.db.kingdom.model import Kingdom
from app.db.publication.model import Publication
from app.db.role.constants import Role
from app.db.role.model import Role as RoleModel
from app.db.session import Base, get_db
from app.db.taxon_name.enums import NaturalisedStatus
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
    test_session_maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
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
    if database_exists(test_db_url):
        drop_database(test_db_url)
    create_database(test_db_url)
    test_engine = create_engine(test_db_url)
    test_engine.execute("CREATE EXTENSION IF NOT EXISTS ltree")
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
        deleted=False,
    )
    test_db.add(user)
    test_db.commit()
    return user


@pytest.fixture
def test_superuser(test_db) -> User:
    """
    Superuser for testing
    """
    return create_user_with_role(Role.SUPER_ADMIN, test_db)


@pytest.fixture
def test_reader(test_db) -> User:
    return create_user_with_role(Role.READER, test_db)


@pytest.fixture
def test_officer(test_db) -> User:
    return create_user_with_role(Role.OFFICER, test_db)


@pytest.fixture
def test_manager(test_db) -> User:
    return create_user_with_role(Role.MANAGER, test_db)


@pytest.fixture
def test_app_support(test_db) -> User:
    return create_user_with_role(Role.APPLICATION_SUPPORT, test_db)


def create_user_with_role(role, test_db) -> User:
    role_name = role["name"]
    user = User(
        email=f"{role_name}@email.com",
        hashed_password=get_password_hash(),
        created_by=None,
        updated_by=None,
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    role = RoleModel(name=role_name, description=role["description"])
    test_db.add(role)
    test_db.commit()
    test_db.refresh(role)
    user_role = UserRoleModel(
        role_id=role.role_id,
        user_id=user.user_id,
        created_by=user.user_id,
        updated_by=user.user_id,
    )
    test_db.add(user_role)
    test_db.commit()
    return user


@pytest.fixture
def test_role(test_db):
    role = RoleModel(name="test role", description="test role description")
    test_db.add(role)
    test_db.commit()
    return role


@pytest.fixture
def test_role2(test_db):
    role = RoleModel(name="test role 2", description="test role description2")
    test_db.add(role)
    test_db.commit()
    return role


@pytest.fixture
def test_user_role(test_db, test_user, test_role, test_superuser):
    user_role = UserRoleModel(
        user_id=test_user.user_id,
        role_id=test_role.role_id,
        created_by=test_superuser.user_id,
        updated_by=test_superuser.user_id,
    )
    test_db.add(user_role)
    test_db.commit()
    return user_role


@pytest.fixture
def test_author(test_db, test_superuser) -> Author:
    """
    Author for testing
    """

    now = datetime.datetime.utcnow()
    author = Author(
        abbreviation="Test Author",
        surname="Author",
        first_names="Test",
        initials="TA",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(author)
    test_db.commit()
    return author


@pytest.fixture
def test_citation(test_db, test_taxon_name, test_author, test_superuser) -> Citation:
    """
    Citation for testing
    """

    return create_citation(test_author, test_db, test_superuser, test_taxon_name)


def create_citation(
    author: Author,
    db: Session,
    user: User,
    taxon_name: TaxonName,
) -> Citation:
    now = datetime.datetime.utcnow()
    citation = Citation(
        taxon_name_id=taxon_name.taxon_name_id,
        author_id=author.author_id,
        author_type="current",
        author_order=0,
        updated_by=user.user_id,
        updated_on=now,
        created_by=user.user_id,
        created_on=now,
    )
    db.add(citation)
    db.commit()
    return citation


@pytest.fixture
def test_classification_system(test_db, test_superuser) -> ClassificationSystem:
    """
    Classification System for testing
    """

    now = datetime.datetime.utcnow()
    classification_system = ClassificationSystem(
        class_desc="CLASS_DESC",
        class_type="informal",
        preferred=True,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(classification_system)
    test_db.commit()
    return classification_system


@pytest.fixture
def test_hierarchical_classification_system(
    test_db, test_superuser
) -> ClassificationSystem:
    """
    Classification System for testing
    """

    now = datetime.datetime.utcnow()
    classification_system = ClassificationSystem(
        class_desc="HIERARCHICAL_CLASS_DESC",
        class_type="hierarchical",
        preferred=True,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
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
        old_name_id=test_taxon_name.taxon_name_id,
        cross_reference_type="misapplied_name",
        new_name_id=test_taxon_name.taxon_name_id,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(cross_reference)
    test_db.commit()
    return cross_reference


@pytest.fixture
def test_hierarchy(
    test_db,
    test_taxon_name,
    test_classification_system,
    test_taxon_name_2,
    test_superuser,
) -> Hierarchy:
    """
    Hierarchy for testing
    """

    now = datetime.datetime.utcnow()
    hierarchy = Hierarchy(
        taxon_name_id=test_taxon_name.taxon_name_id,
        classification_system_id=test_classification_system.classification_system_id,
        parent_nid=test_taxon_name_2.taxon_name_id,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(hierarchy)
    test_db.commit()
    test_db.refresh(hierarchy)
    hierarchy.calculate_path(db=test_db)
    return hierarchy


def create_hierarchy(
    name: TaxonName,
    parent: TaxonName,
    test_classification_system: ClassificationSystem,
    user: User,
    test_db: Session,
) -> Hierarchy:
    hierarchy = Hierarchy(
        parent_nid=parent.taxon_name_id,
        classification_system_id=test_classification_system.classification_system_id,
        taxon_name_id=name.taxon_name_id,
        created_by=user.user_id,
        updated_by=user.user_id,
    )
    test_db.add(hierarchy)
    test_db.commit()
    hierarchy.calculate_path(db=test_db)
    return hierarchy


@pytest.fixture
def test_hierarchies(
    test_chordata,
    test_animalia,
    test_classification_system,
    test_mammalia,
    test_reptilia,
    test_carnivora,
    test_panthera,
    test_superuser,
    test_db,
):
    return {
        "chordate": create_hierarchy(
            test_chordata,
            test_animalia,
            test_classification_system,
            test_superuser,
            test_db,
        ),
        "mammal": create_hierarchy(
            test_mammalia,
            test_chordata,
            test_classification_system,
            test_superuser,
            test_db,
        ),
        "reptile": create_hierarchy(
            test_reptilia,
            test_chordata,
            test_classification_system,
            test_superuser,
            test_db,
        ),
        "carnivore": create_hierarchy(
            test_carnivora,
            test_mammalia,
            test_classification_system,
            test_superuser,
            test_db,
        ),
        "panther": create_hierarchy(
            test_panthera,
            test_carnivora,
            test_classification_system,
            test_superuser,
            test_db,
        ),
    }


@pytest.fixture
def test_infrageneric_hierarchies(
    test_hierarchies,
    test_db,
    test_classification_system,
    test_superuser,
    test_panthera,
    test_panthera_subg_eupanthera,
    test_panthera_leo,
    test_panthera_leo_subsp_barbarensis,
):
    loguru.logger.debug(test_db)
    test_hierarchies["subg_eupanthera"] = create_hierarchy(
        test_panthera_subg_eupanthera,
        test_panthera,
        test_classification_system,
        test_superuser,
        test_db,
    )
    test_hierarchies["panthera_leo"] = create_hierarchy(
        test_panthera_leo,
        test_panthera_subg_eupanthera,
        test_classification_system,
        test_superuser,
        test_db,
    )
    test_hierarchies["panthera_leo_barbarensis"] = create_hierarchy(
        test_panthera_leo_subsp_barbarensis,
        test_panthera_leo,
        test_classification_system,
        test_superuser,
        test_db,
    )
    return test_hierarchies


@pytest.fixture
def test_informal_group(
    test_db, test_taxon_name, test_classification_system, test_superuser
) -> InformalGroup:
    """
    Informal Group for testing
    """

    now = datetime.datetime.utcnow()
    informal_group = InformalGroup(
        taxon_name_id=test_taxon_name.taxon_name_id,
        classification_system_id=test_classification_system.classification_system_id,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
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
        kingdom_name="Kingdom1",
        kingdom_desc="Kingdom Description",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
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
        abbreviated_title="PUBLICATION",
        title="PUBLICATION_NAME",
        publication_day=23,
        publication_month=12,
        publication_year=1998,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(publication)
    test_db.commit()
    return publication


@pytest.fixture
def test_taxon_name(
    test_db, test_kingdom, test_taxon_rank, test_publication, test_superuser
) -> TaxonName:
    """
    Taxon Name for testing
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id=test_kingdom.kingdom_id,
        rank_id=test_taxon_rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial="Testuninomial",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(taxon_name)
    test_db.commit()
    test_db.refresh(taxon_name)
    return taxon_name


@pytest.fixture
def test_checklist_name(
    test_db, test_taxon_name, test_informal_group, test_vernacular, test_panthera
) -> TaxonName:
    test_taxon_name.naturalised_status = NaturalisedStatus.native
    test_taxon_name.review = True
    test_taxon_name.review_reason = "Test review reason"
    test_db.add(test_taxon_name)
    test_vernacular.preferred = True
    test_db.add(test_vernacular)
    test_db.commit()
    return test_taxon_name


@pytest.fixture
def test_animalia(
    test_db, test_kingdom, test_publication, test_superuser, test_rank_kingdom
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Animalia", now, test_db, test_kingdom, test_superuser, test_rank_kingdom
    )


@pytest.fixture
def test_chordata(
    test_db, test_kingdom, test_publication, test_superuser, test_rank_phylum
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Chordata", now, test_db, test_kingdom, test_superuser, test_rank_phylum
    )


@pytest.fixture
def test_mammalia(
    test_db, test_kingdom, test_publication, test_superuser, test_rank_class
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Mammalia", now, test_db, test_kingdom, test_superuser, test_rank_class
    )


@pytest.fixture
def test_reptilia(
    test_db, test_kingdom, test_publication, test_superuser, test_rank_class
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Reptilia", now, test_db, test_kingdom, test_superuser, test_rank_class
    )


@pytest.fixture
def test_carnivora(
    test_db, test_kingdom, test_publication, test_superuser, test_rank_order
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Carnivora", now, test_db, test_kingdom, test_superuser, test_rank_order
    )


@pytest.fixture
def test_felidae(
    test_db, test_kingdom, test_publication, test_superuser, test_rank_family
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Felidae", now, test_db, test_kingdom, test_superuser, test_rank_family
    )


@pytest.fixture
def test_panthera(
    test_db, test_kingdom, test_publication, test_superuser, test_rank_genus
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Panthera", now, test_db, test_kingdom, test_superuser, test_rank_genus
    )


@pytest.fixture
def test_panthera_subg_eupanthera(
    test_db,
    test_kingdom,
    test_publication,
    test_superuser,
    test_rank_subgenus,
    test_author,
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Eupanthera",
        now,
        test_db,
        test_kingdom,
        test_superuser,
        test_rank_subgenus,
        author=test_author,
        year=2012,
    )


@pytest.fixture
def test_panthera_leo(
    test_db,
    test_kingdom,
    test_publication,
    test_superuser,
    test_rank_species,
    test_author,
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Panthera",
        now,
        test_db,
        test_kingdom,
        test_superuser,
        test_rank_species,
        specific_epithet="leo",
        year=1966,
        author=test_author,
    )


@pytest.fixture
def test_panthera_leo_subsp_barbarensis(
    test_db,
    test_superuser,
    test_kingdom,
    test_publication,
    test_rank_subspecies,
    test_author,
) -> TaxonName:
    """
    Taxon Name for testing
    """
    now = datetime.datetime.utcnow()
    return create_taxon_name(
        "Panthera",
        now,
        test_db,
        test_kingdom,
        test_superuser,
        test_rank_subspecies,
        specific_epithet="leo",
        infraspecific_epithet="barbarensis",
        year=2023,
        author=test_author,
    )


def create_taxon_name(
    name: str,
    now: datetime,
    db: Session,
    kingdom: Kingdom,
    user: User,
    rank: TaxonRank,
    specific_epithet=None,
    infraspecific_epithet=None,
    year: int = None,
    author: Author = None,
):
    taxon_name = TaxonName(
        kingdom_id=kingdom.kingdom_id,
        rank_id=rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial=name,
        form_desc_yr=year,
        specific_epithet=specific_epithet,
        infraspecific_epithet=infraspecific_epithet,
        updated_by=user.user_id,
        updated_on=now,
        created_by=user.user_id,
        created_on=now,
    )
    db.add(taxon_name)
    db.commit()
    if author:
        create_citation(author, db, user, taxon_name)
    db.refresh(taxon_name)

    return taxon_name


@pytest.fixture
def test_taxon_name_2(
    test_db, test_kingdom, test_taxon_rank, test_publication, test_superuser
) -> TaxonName:
    """
    Taxon Name 2 for testing
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id=test_kingdom.kingdom_id,
        rank_id=test_taxon_rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial="Testuninomial2",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(taxon_name)
    test_db.commit()
    return taxon_name


@pytest.fixture
def test_taxon_name_3(
    test_db, test_kingdom, test_taxon_rank, test_publication, test_superuser
) -> TaxonName:
    """
    Taxon Name 3 for testing
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id=test_kingdom.kingdom_id,
        rank_id=test_taxon_rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial="Testuninomial3",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(taxon_name)
    test_db.commit()
    return taxon_name


@pytest.fixture
def test_taxon_name_canonical_name_1(
    test_db, test_kingdom, test_taxon_rank, test_publication, test_superuser
) -> TaxonName:
    """
    Taxon Name for testing Canonical Name - Genus only
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id=test_kingdom.kingdom_id,
        rank_id=test_taxon_rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial="Acanthiza",
        specific_epithet=None,
        infraspecific_epithet=None,
        canonical_name="Acanthiza",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(taxon_name)
    test_db.commit()
    return taxon_name


@pytest.fixture
def test_taxon_name_canonical_name_2(
    test_db, test_kingdom, test_taxon_rank, test_publication, test_superuser
) -> TaxonName:
    """
    Taxon Name for testing Canonical Name - Genus and specific_epithet
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id=test_kingdom.kingdom_id,
        rank_id=test_taxon_rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial="Acanthiza",
        specific_epithet="iredalei",
        infraspecific_epithet=None,
        canonical_name="Acanthiza iredalei",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(taxon_name)
    test_db.commit()
    return taxon_name


@pytest.fixture
def test_taxon_name_canonical_name_3(
    test_db, test_kingdom, test_taxon_rank, test_publication, test_superuser
) -> TaxonName:
    """
    Taxon Name for testing Canonical Name - Genus, specific_epithet and
     infraspecific_epithet
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id=test_kingdom.kingdom_id,
        rank_id=test_taxon_rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial="Acanthiza",
        specific_epithet="iredalei",
        infraspecific_epithet="iredalei",
        canonical_name="Acanthiza iredalei iredalei",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
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
        kingdom_id=test_kingdom.kingdom_id,
        rank_name="Rank Name 1",
        rank_abbrev="subvar",
        uninomial=False,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(taxon_rank)
    test_db.commit()
    return taxon_rank


@pytest.fixture
def test_rank_kingdom(test_db, test_kingdom, test_superuser) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(None, "Kingdom", test_db, test_kingdom, test_superuser)


@pytest.fixture
def test_rank_phylum(
    test_db, test_kingdom, test_superuser, test_rank_kingdom
) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(
        test_rank_kingdom, "Phylum", test_db, test_kingdom, test_superuser
    )


@pytest.fixture
def test_rank_class(
    test_db, test_kingdom, test_superuser, test_rank_phylum
) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(test_rank_phylum, "Class", test_db, test_kingdom, test_superuser)


@pytest.fixture
def test_rank_order(
    test_db, test_kingdom, test_superuser, test_rank_class
) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(test_rank_class, "Order", test_db, test_kingdom, test_superuser)


@pytest.fixture
def test_rank_family(
    test_db, test_kingdom, test_superuser, test_rank_order
) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(test_rank_order, "Family", test_db, test_kingdom, test_superuser)


@pytest.fixture
def test_rank_genus(
    test_db, test_kingdom, test_superuser, test_rank_family
) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(test_rank_family, "Genus", test_db, test_kingdom, test_superuser)


@pytest.fixture
def test_rank_subgenus(
    test_db, test_kingdom, test_superuser, test_rank_genus
) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(
        test_rank_genus, "Subgenus", test_db, test_kingdom, test_superuser
    )


@pytest.fixture
def test_rank_species(
    test_db, test_kingdom, test_superuser, test_rank_genus
) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(
        test_rank_genus, "Species", test_db, test_kingdom, test_superuser
    )


@pytest.fixture
def test_rank_subspecies(
    test_db, test_kingdom, test_superuser, test_rank_species
) -> TaxonRank:
    """
    Taxon Rank for testing
    """

    return create_rank(
        test_rank_species, "Subspecies", test_db, test_kingdom, test_superuser
    )


def create_rank(parent, rank_name, test_db, test_kingdom, test_superuser):
    now = datetime.datetime.utcnow()
    taxon_rank = TaxonRank(
        kingdom_id=test_kingdom.kingdom_id,
        rank_name=rank_name,
        uninomial=False,
        updated_by=test_superuser.user_id,
        updated_on=now,
        direct_parent_rank=parent,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(taxon_rank)
    test_db.commit()
    return taxon_rank


@pytest.fixture
def test_taxon_name_canonical_name_4(
    test_db, test_kingdom, test_taxon_rank, test_superuser
) -> TaxonName:
    """
    Taxon Name for testing Canonical Name without rank
    """

    now = datetime.datetime.utcnow()
    taxon_name = TaxonName(
        kingdom_id=test_kingdom.kingdom_id,
        rank_id=test_taxon_rank.taxon_rank_id,
        is_current=True,
        validated=True,
        uninomial="Acanthiza",
        specific_epithet="iredalei",
        infraspecific_epithet="iredalei",
        canonical_name="Acanthiza iredalei iredalei",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(taxon_name)
    test_db.commit()
    return taxon_name


@pytest.fixture
def test_vernacular(test_db, test_taxon_name, test_superuser) -> Vernacular:
    """
    Vernacular for testing
    """

    now = datetime.datetime.utcnow()
    vernacular = Vernacular(
        taxon_name_id=test_taxon_name.taxon_name_id,
        vernacular_name="Vernacular 1",
        language="english",
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(vernacular)
    test_db.commit()
    return vernacular


@pytest.fixture
def test_conservation_code(test_db, test_superuser) -> Conservationcode:
    """
    Conservation code for testing
    """

    now = datetime.datetime.utcnow()
    conservation_code = Conservationcode(
        conservation_code_value="P1",
        authorising_org="State",
        code_priority=102,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(conservation_code)
    test_db.commit()
    return conservation_code


# @pytest.fixture
# def test_conscode_taxon(
#     test_db, test_taxon_name, test_conservation_code, test_superuser) -> Conscodetaxon:
#     """
#     Conservation code Taxon for testing
#     """
#     return create_conscode_taxon(test_conservation_code, test_db, test_superuser, test_taxon_name)


# def create_conscode_taxon(
#         conservation_code: Conservationcode,
#         db: Session,
#         user: User,
#         taxon_name: TaxonName,
#     ) -> Conscodetaxon:
#         now = datetime.datetime.utcnow()
#         conscode_taxon = Conscodetaxon(
#             taxon_name_id=test_taxon_name.taxon_name_id,
#             conservation_code_id=test_conservation_code.conservation_code_id,
#             effective_from= test_conscode_taxon.effective_from.isoformat(),
#             effective_to= test_conscode_taxon.effective_to,
#             # "effective_from": test_conscode_taxon.effective_from,
#             notes= test_conscode_taxon.notes,
#             updated_by=user.user_id,
#             updated_on=now,
#             created_by=user.user_id,
#             created_on=now,
#         )
#         db.add(conscode_taxon)
#         db.commit()
#         return conscode_taxon


def verify_password_mock(first: str, second: str) -> bool:
    return True


@pytest.fixture
def user_token_headers(
    client: TestClient, test_user, test_password, monkeypatch
) -> t.Dict[str, str]:
    return token_headers_for_user(client, test_password, test_user, monkeypatch)


def token_headers_for_user(client, test_password, user, monkeypatch):
    monkeypatch.setattr(security, "verify_password", verify_password_mock)
    login_data = {
        "username": user.email,
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
    return token_headers_for_user(client, test_password, test_superuser, monkeypatch)


@pytest.fixture
def reader_token_headers(
    client: TestClient, test_reader, test_password, monkeypatch
) -> t.Dict[str, str]:
    monkeypatch.setattr(security, "verify_password", verify_password_mock)
    return token_headers_for_user(client, test_password, test_reader, monkeypatch)


@pytest.fixture
def officer_token_headers(
    client: TestClient, test_officer, test_password, monkeypatch
) -> t.Dict[str, str]:
    monkeypatch.setattr(security, "verify_password", verify_password_mock)
    return token_headers_for_user(client, test_password, test_officer, monkeypatch)


@pytest.fixture
def manager_token_headers(
    client: TestClient, test_manager, test_password, monkeypatch
) -> t.Dict[str, str]:
    monkeypatch.setattr(security, "verify_password", verify_password_mock)
    return token_headers_for_user(client, test_password, test_manager, monkeypatch)


@pytest.fixture
def app_support_token_headers(
    client: TestClient, test_app_support, test_password, monkeypatch
) -> t.Dict[str, str]:
    monkeypatch.setattr(security, "verify_password", verify_password_mock)
    return token_headers_for_user(client, test_password, test_app_support, monkeypatch)


@pytest.fixture
def checklist_api_key(monkeypatch):
    key = "checklist_api_key"
    monkeypatch.setenv("API_KEY_CHECKLIST", key)
    return key


@pytest.fixture
def import_api_key(monkeypatch):
    key = "import_api_key"
    monkeypatch.setenv("IMPORT_API_KEY_TEST", key)
    return key
