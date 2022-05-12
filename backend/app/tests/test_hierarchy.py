import datetime

from app.db.hierarchy.model import Hierarchy


def test_hierarchy_children(
    test_db,
    test_kingdom,
    test_classification_system,
    test_animalia,
    test_chordata,
    test_mammalia,
    test_carnivora,
    test_superuser,
):

    now = datetime.datetime.utcnow()
    name = test_animalia
    animal = create_hierarchy(
        name, now, None, test_classification_system, test_db, test_superuser
    )
    chordate = create_hierarchy(
        test_chordata, now, animal, test_classification_system, test_db, test_superuser
    )
    mammal = create_hierarchy(
        test_mammalia,
        now,
        chordate,
        test_classification_system,
        test_db,
        test_superuser,
    )
    carnivore = create_hierarchy(
        test_carnivora, now, mammal, test_classification_system, test_db, test_superuser
    )

    print(animal.children())
    assert animal.children()


def create_hierarchy(
    name, now, parent, test_classification_system, test_db, test_superuser
) -> Hierarchy:
    hierarchy = Hierarchy(
        taxon_name=name,
        classification_system=test_classification_system,
        parent=parent,
        updated_by=test_superuser.user_id,
        updated_on=now,
        created_by=test_superuser.user_id,
        created_on=now,
    )
    test_db.add(hierarchy)
    test_db.commit()
    return hierarchy
