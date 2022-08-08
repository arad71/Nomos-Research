from loguru import logger
from sqlalchemy import Column, ForeignKey, Index, Integer, Sequence, and_, event, func
from sqlalchemy.engine import Connection
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import Session, backref, foreign, relationship, remote
from sqlalchemy.orm.attributes import set_committed_value
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
    path = Column(LtreeType, nullable=True)

    parent = relationship(
        "Hierarchy",
        primaryjoin=(remote(path) == foreign(func.subpath(path, 0, -1))),
        viewonly=True,
        post_update=True,
    )
    ancestors = relationship(
        "Hierarchy",
        primaryjoin=foreign(path).bool_op("<@")(remote(path)),
        viewonly=True,
        order_by=remote(path),
        uselist=True,
        post_update=True,
    )
    children = relationship(
        "Hierarchy",
        primaryjoin=(foreign(path) == remote(func.subpath(path, 0, -1))),
        viewonly=True,
    )

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
        backref=backref("hierarchies", cascade="all, delete-orphan"),
        lazy="joined",
        single_parent=True,
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
    parent_name = relationship(
        "TaxonName",
        foreign_keys=[parent_nid],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("hierarchy_children", cascade="all, delete-orphan"),
    )

    direct_parent = relationship(
        "Hierarchy",
        backref=backref(
            "direct_children",
        ),
        primaryjoin=and_(
            remote(taxon_name_id) == foreign(parent_nid),
            remote(classification_system_id) == foreign(classification_system_id),
        ),
        viewonly=True,
        post_update=True,
    )
    rank_name = association_proxy("taxon_name", "rank_name")
    scientific_name = association_proxy("taxon_name", "scientific_name")

    formatted_scientific_name = association_proxy(
        "taxon_name", "formatted_scientific_name"
    )
    # Use these properties for pretty printing the record
    __repr_attrs__ = [
        "classification_system_id",
        "taxon_name_id",
        "parent_nid",
        "path",
        "scientific_name",
        "rank_name",
    ]
    __table_args__ = (
        UniqueConstraint(
            "taxon_name_id",
            "classification_system_id",
            name=f"uc_{ __tablename__}_legacy_id",
        ),
        Index("ix_nodes_path", path, postgresql_using="gist"),
        {"comment": TABLE_DESCRIPTION},
    )

    @staticmethod
    def ltree(id_value: int):
        return Ltree(str(id_value))

    def get_path(self):
        return self.get_parent_path() + self.ltree(self.taxon_name_id)

    def get_parent_path(self):
        logger.debug(self)
        parent_path = None
        if self.parent_nid:
            parent_hierarchy = self.where(
                taxon_name_id=self.parent_nid,
                classification_system_id=self.classification_system_id,
            ).first()
            if parent_hierarchy:
                parent_path = parent_hierarchy.path
        if not parent_path:
            parent_path = self.ltree(self.classification_system_id)
        return parent_path

    def calculate_path(self, parent: "Hierarchy" = None):
        logger.debug("Setting path")
        logger.debug(self)
        new_path = self.get_path()
        logger.debug(new_path)
        values = {"path": new_path}
        self.path = new_path
        if parent:
            if parent:
                self.updated_by = parent.updated_by
                self.updated_on = parent.updated_on
        else:
            session: Session = self.session
            values = {"path": new_path}
            # TODO: Make this save in a transaction
            set_committed_value(self, "path", new_path)
            logger.debug('about to set values')
            session.execute(
                self.__table__.update()
                .values(values)
                .where(Hierarchy.hierarchy_id == self.hierarchy_id)
            )
            logger.debug('set values')
            logger.debug(self)
        # self.save()
        self.session.refresh(self)
        # self.session.commit()
        # self.update(values)

    def calculate_path_for_children(self):
        child: Hierarchy
        for child in self.direct_children:
            child.calculate_path(parent=self)
            child.calculate_path_for_children()

    def find_root_parent(self: "Hierarchy") -> "Hierarchy":
        parent = self.direct_parent
        if parent:
            parent = self.direct_parent.find_root_parent()
        return parent or self

    @staticmethod
    def rebuild_hierarchy_paths():
        logger.info("Rebuilding hierarchy paths")
        done = set()
        hierarchy: Hierarchy
        for hierarchy in Hierarchy.where(deleted=False):
            root = hierarchy.find_root_parent()
            if root not in done:
                logger.debug("Rebuilding hierarchy for {} and descendants.", root)
                root.calculate_path()
                root.calculate_path_for_children()
                done.add(root)
        return done


# @event.listens_for(Hierarchy, "after_insert")
# @event.listens_for(Hierarchy, "after_update")
def calculate_fields(
    mapper,
    connection: Connection,
    hierarchy: Hierarchy,
):

    hierarchy.calculate_path()


def rebuild_hierarchy_for_children(hierarchy_id: int):
    logger.debug('started')
    hierarchy: Hierarchy = Hierarchy.find(hierarchy_id)
    hierarchy.calculate_path()
    hierarchy.calculate_path_for_children()
    hierarchy.session.flush()
    hierarchy.session.commit()
    logger.debug('finished')
