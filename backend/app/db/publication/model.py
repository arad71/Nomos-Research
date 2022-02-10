from sqlalchemy import Column, Integer, String, Text

from app.db.models import TableMixin
from app.db.session import Base


class Publication(Base, TableMixin):
    __tablename__ = "publication"

    publication_id = Column(Integer, primary_key=True, index=True)
    bad_publication = Column(String(1))
    publication = Column(Text(convert_unicode=True))
    publication_name = Column(Text(convert_unicode=True))
