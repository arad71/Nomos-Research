from sqlalchemy.sql import expression
from sqlalchemy_utils import Ltree
from sqlalchemy_utils.types.ltree import LTXTQUERY

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
    assert test_panthera.genus == "Panthera"
    assert test_panthera.genus == "Panthera"
    assert test_panthera.phylum == "Chordata"
    assert test_panthera.taxon_class == "Reptilia"
    assert test_reptilia.phylum == "Chordata"
