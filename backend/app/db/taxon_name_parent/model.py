import sqlalchemy
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import CheckConstraint, Index

from app.db.models import BaseModel, TableMixin
from app.db.taxon_name.model import TaxonName

from . import constants


class TaxonNameParent(BaseModel, TableMixin):
    __tablename__ = "taxon_name_parent"
    name_plural = "taxon_name_parents"
    __repr_attrs__ = [
        "taxon_name_parent_id",
        "taxon_name_id",
        "parent_taxon_name_id",
        "sequence",
    ]

    taxon_name_parent_id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    taxon_name_id = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment=constants.TAXON_NAME_ID,
        doc=constants.TAXON_NAME_ID,
    )
    parent_taxon_name_id = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment=constants.PARENT_TAXON_NAME_ID,
        doc=constants.PARENT_TAXON_NAME_ID,
    )
    sequence = sqlalchemy.Column(
        sqlalchemy.Integer,
        nullable=False,
        comment=constants.SEQUENCE,
        doc=constants.SEQUENCE,
    )

    taxon_name = relationship(
        "TaxonName",
        foreign_keys=[taxon_name_id],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("taxon_name_parents", cascade="all, delete-orphan"),
        lazy="joined",
        single_parent=True,
    )
    parent_taxon_name = relationship(
        "TaxonName",
        foreign_keys=[parent_taxon_name_id],
        remote_side=[TaxonName.taxon_name_id],
        lazy="joined",
    )

    __table_args__ = (
        CheckConstraint(
            "taxon_name_id <> parent_taxon_name_id",
            name="ck_taxon_name_parent_not_self",
        ),
        Index(
            f"ix_{__tablename__}_taxon_name_id_sequence_isactive",
            "taxon_name_id",
            "sequence",
            unique=True,
            postgresql_where=sqlalchemy.text("deleted = FALSE"),
        ),
        Index(
            f"ix_{__tablename__}_taxon_parent_isactive",
            "taxon_name_id",
            "parent_taxon_name_id",
            unique=True,
            postgresql_where=sqlalchemy.text("deleted = FALSE"),
        ),
        {
            "comment": constants.TABLE_DESCRIPTION,
        },
    )
