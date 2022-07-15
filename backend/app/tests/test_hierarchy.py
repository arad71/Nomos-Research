from sqlalchemy.sql import expression
from sqlalchemy_utils import Ltree
from sqlalchemy_utils.types.ltree import LTXTQUERY

from app.db.hierarchy.model import Hierarchy, rebuild_hierarchy_for_children


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

    chordate = test_hierarchies["chordate"]
    mammal = test_hierarchies["mammal"]
    reptile = test_hierarchies["reptile"]
    carnivore = test_hierarchies["carnivore"]
    panther = test_hierarchies["panther"]
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
    carnivore.save()
    carnivore.calculate_path_for_children()
    test_db.refresh(carnivore)
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

    match = Hierarchy.query.filter(
        Hierarchy.path.ltxtquery(
            expression.cast(str(carnivore.taxon_name_id), LTXTQUERY)
        )
    ).all()

    assert carnivore in match
    assert panther in match
    assert chordate not in match

    test_db.execute("UPDATE hierarchy SET PATH = null WHERE path IS NOT NULL")
    chordate.calculate_path()
    rebuild_hierarchy_for_children(chordate.hierarchy_id)
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
    assert test_panthera.phylum == "Chordata"
    assert test_panthera.taxon_class == "Reptilia"
    assert test_panthera.genus == "Panthera"
    assert test_reptilia.phylum == "Chordata"
