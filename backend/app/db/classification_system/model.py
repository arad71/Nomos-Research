from sqlalchemy import Column, Integer, String
from sqlalchemy.types import Enum

from app.db.classification_system import enums
from app.db.models import TableMixin
from app.db.session import Base


class ClassificationSystem(Base, TableMixin):
    __tablename__ = "classification_system"
    __table_args__ = {
        "comment": "The hierarchical classification systems supported within the WA Herbarium"
    }

    classification_system_id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Primary key. The taxonomic classification system used for this parentage",
    )
    class_desc = Column(
        String(200), nullable=False, comment="Description of classification system"
    )
    class_type = Column(
        Enum(enums.ClassificationType, name=__tablename__ + "__class_type"),
        nullable=False,
        comment="The type of classification system: INFORMAL - non-hierarchical informal grouping; HIERARCHICAL - a formal hierarchical grouping",
    )
    preferred = Column(
        Enum(enums.ClassificationPreferred, name=__tablename__ + "__preferred"),
        comment="Because a taxon can belong to more than one group this field provides a mechanism choosing a single preferred group",
    )
    sort_order = Column(
        Integer,
        comment="An optional value to sort the order classification system categories",
    )
