from sqlalchemy.sql import expression
from sqlalchemy_utils import Ltree
from sqlalchemy_utils.types.ltree import LTXTQUERY

from app.db.hierarchy.model import Hierarchy


def test_hierarchy_children(
    test_db,
    test_kingdom,
    test_hierarchies,
    test_classification_system,
    #  1
    test_animalia,
    #  2
    test_chordata,
    # 3
    test_mammalia,
    # 4
    test_reptilia,
    # 5
    test_carnivora,
    # 6
    test_panthera,
    test_superuser,
):
    db = test_db
    chordate: Hierarchy = test_hierarchies["chordate"]
    mammal: Hierarchy = test_hierarchies["mammal"]
    reptile: Hierarchy = test_hierarchies["reptile"]
    carnivore: Hierarchy = test_hierarchies["carnivore"]
    panther: Hierarchy = test_hierarchies["panther"]
    assert carnivore.direct_parent == mammal
    assert mammal.direct_children == [carnivore]
    assert mammal.parent_name == test_chordata
    test_db.refresh(chordate)
    assert chordate.path == Ltree(
        "{}.{}".format(
            test_classification_system.classification_system_id, chordate.taxon_name_id
        )
    )
    assert mammal.path == Ltree(
        "{}.{}.{}".format(
            test_classification_system.classification_system_id,
            chordate.taxon_name_id,
            mammal.taxon_name_id,
        )
    )
    assert carnivore.path == Ltree(
        "{}.{}.{}.{}".format(
            test_classification_system.classification_system_id,
            chordate.taxon_name_id,
            mammal.taxon_name_id,
            carnivore.taxon_name_id,
        )
    )
    test_db.refresh(panther)
    assert panther.path == Ltree(
        "{}.{}.{}.{}.{}".format(
            test_classification_system.classification_system_id,
            chordate.taxon_name_id,
            mammal.taxon_name_id,
            carnivore.taxon_name_id,
            panther.taxon_name_id,
        )
    )
    carnivore.parent_nid = reptile.taxon_name_id
    test_db.add(carnivore)
    test_db.commit()
    test_db.refresh(carnivore)
    carnivore.calculate_path(db=db)
    carnivore.calculate_path_for_children(db=db)
    assert carnivore.path == Ltree(
        "{}.{}.{}.{}".format(
            test_classification_system.classification_system_id,
            chordate.taxon_name_id,
            reptile.taxon_name_id,
            carnivore.taxon_name_id,
        )
    )
    test_db.refresh(panther)
    assert panther.path == Ltree(
        "{}.{}.{}.{}.{}".format(
            test_classification_system.classification_system_id,
            chordate.taxon_name_id,
            reptile.taxon_name_id,
            carnivore.taxon_name_id,
            panther.taxon_name_id,
        )
    )
    assert panther.find_root_parent() == chordate
    Hierarchy.set_session(test_db)
    match = Hierarchy.query.filter(
        Hierarchy.path.ltxtquery(
            expression.cast(str(carnivore.taxon_name_id), LTXTQUERY)
        )
    ).all()

    assert carnivore in match
    assert panther in match
    assert chordate not in match

    test_db.execute("UPDATE hierarchy SET PATH = NULL WHERE path IS NOT NULL")
    test_db.commit()
    test_db.refresh(chordate)
    assert chordate.path is None
    chordate.calculate_path(db=db)
    chordate.calculate_path_for_children(db=db)
    test_db.refresh(panther)
    assert panther.path == Ltree(
        "{}.{}.{}.{}.{}".format(
            test_classification_system.classification_system_id,
            chordate.taxon_name_id,
            reptile.taxon_name_id,
            carnivore.taxon_name_id,
            panther.taxon_name_id,
        )
    )
