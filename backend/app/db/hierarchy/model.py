from fastapi import Depends
from sqlalchemy import Column, ForeignKey, Index, Integer, Sequence, func
from sqlalchemy.orm import backref, foreign, relationship, remote
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy_utils import Ltree, LtreeType

from app.db.hierarchy.constants import (
    CLASSIFICATION_SYSTEM_ID,
    PARENT_NAME_ID,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)
from app.db.models import BaseModel, TableMixin
from app.db.session import get_db
from app.db.taxon_name.model import TaxonName

id_seq = Sequence("hierarchy_hierarchy_id_seq")


class Hierarchy(BaseModel, TableMixin):
    __tablename__ = "hierarchy"
    name_plural = "hierarchies"

    hierarchy_id = Column(Integer, id_seq, primary_key=True)
    path = Column(LtreeType, nullable=False)

    parent = relationship(
        "Hierarchy",
        primaryjoin=(remote(path) == foreign(func.subpath(path, 0, -1))),
        backref="children",
        viewonly=True,
    )

    def __init__(
        self,
        taxon_name,
        classification_system,
        parent=None,
        updated_by=None,
        updated_on=None,
        created_by=None,
        created_on=None,
        engine=Depends(get_db),
    ):
        _id = engine.execute(id_seq)
        self.hierarchy_id = _id
        self.taxon_name = taxon_name
        self.classification_system = classification_system
        self.updated_by = updated_by
        self.updated_on = updated_on
        self.created_by = created_by
        self.created_on = created_on
        self.parent = parent

        # self.name = name
        ltree_id = Ltree(str(_id))
        self.path = ltree_id if parent is None else parent.path + ltree_id

    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
    )
    taxon_name = relationship(
        "TaxonName",
        foreign_keys=[taxon_name_id],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("names", cascade="all, delete-orphan"),
    )
    classification_system_id = Column(
        Integer,
        ForeignKey("classification_system.classification_system_id"),
        index=True,
        comment=CLASSIFICATION_SYSTEM_ID,
        doc=CLASSIFICATION_SYSTEM_ID,
    )
    classification_system = relationship("ClassificationSystem", backref=name_plural)
    parent_nid = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment=PARENT_NAME_ID,
        doc=PARENT_NAME_ID,
    )
    # parent = relationship(
    #     "TaxonName",
    #     foreign_keys=[parent_nid],
    #     remote_side=[TaxonName.taxon_name_id],
    #     backref=backref("children", cascade="all, delete-orphan"),
    # )

    __table_args__ = (
        UniqueConstraint(
            "taxon_name_id",
            "classification_system_id",
            name=f"uc_{ __tablename__}_legacy_id",
        ),
        Index("ix_nodes_path", path, postgresql_using="gist"),
        {"comment": TABLE_DESCRIPTION},
    )
