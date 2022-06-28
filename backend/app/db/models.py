from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, func
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy_mixins import AllFeaturesMixin

from app.db.session import Base


class BaseModel(Base, AllFeaturesMixin):
    __abstract__ = True


# See https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/mixins.html
class TableMixin(object):
    @declared_attr
    def updated_by(cls):
        return Column(
            Integer,
            ForeignKey("user.user_id"),
            comment="The person who updated this record",
        )

    @declared_attr
    def updated_on(cls):
        return Column(
            TIMESTAMP(timezone=True),
            default=func.current_timestamp(),
            onupdate=func.current_timestamp(),
            comment="The date this record was updated on",
        )

    @declared_attr
    def created_by(cls):
        return Column(
            Integer,
            ForeignKey("user.user_id"),
            comment="The person who created this record",
        )

    @declared_attr
    def created_on(cls):
        return Column(
            TIMESTAMP(timezone=True),
            default=func.current_timestamp(),
            comment="The date this record was created on",
        )


class PublicationAuthor(BaseModel):
    __tablename__ = "publication_author"

    publication_id = Column(ForeignKey("publication.publication_id"), primary_key=True)
    author_id = Column(ForeignKey("author.author_id"), primary_key=True)
