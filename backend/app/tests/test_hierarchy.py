from sqlalchemy_utils import Ltree

from app.db.classification_system.model import ClassificationSystem
from app.db.hierarchy.model import Hierarchy
from app.db.taxon_name.model import TaxonName


def create_hierarchy(
    name: TaxonName,
    parent: TaxonName,
    test_classification_system: ClassificationSystem,
) -> Hierarchy:
    hierarchy = Hierarchy(
        parent_nid=parent.taxon_name_id,
        classification_system_id=test_classification_system.classification_system_id,
        taxon_name_id=name.taxon_name_id,
    )
    hierarchy.save()
    return hierarchy


def test_hierarchy_children(
    test_db,
    test_kingdom,
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

    chordate = create_hierarchy(
        test_chordata,
        test_animalia,
        test_classification_system,
    )
    mammal = create_hierarchy(
        test_mammalia,
        test_chordata,
        test_classification_system,
    )
    reptile = create_hierarchy(
        test_reptilia,
        test_chordata,
        test_classification_system,
    )
    carnivore = create_hierarchy(
        test_carnivora,
        test_mammalia,
        test_classification_system,
    )
    panther = create_hierarchy(
        test_panthera,
        test_carnivora,
        test_classification_system,
    )
    assert carnivore.direct_parent == mammal
    assert mammal.direct_children == [carnivore]
    assert mammal.parent_name == test_chordata
    assert chordate.path == Ltree(f"1.2")
    assert mammal.path == Ltree("1.2.3")
    assert carnivore.path == Ltree("1.2.3.5")
    assert panther.path == Ltree("1.2.3.5.6")
    carnivore.parent_nid = reptile.taxon_name_id
    carnivore.save()
    assert carnivore.path == Ltree("1.2.4.5")
    assert panther.path == Ltree("1.2.4.5.6")

    assert panther.find_root_parent() == chordate
