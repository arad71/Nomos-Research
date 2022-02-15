from sqlalchemy import Column, DateTime, ForeignKey, Integer, func
from sqlalchemy.ext.declarative import declared_attr

from app.db.session import Base


# See https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/mixins.html
class TableMixin(object):
    @declared_attr
    def updated_by(cls):
        return Column(Integer, ForeignKey("user.user_id"))

    @declared_attr
    def updated_on(cls):
        return Column(DateTime, onupdate=func.current_timestamp())

    @declared_attr
    def created_by(cls):
        return Column(Integer, ForeignKey("user.user_id"))

    @declared_attr
    def created_on(cls):
        return Column(DateTime, default=func.current_timestamp())


class PublicationAuthor(Base):
    __tablename__ = "publication_author"

    publication_id = Column(ForeignKey("publication.publication_id"), primary_key=True)
    author_id = Column(ForeignKey("author.author_id"), primary_key=True)
