#!/usr/bin/env python3
from sqlalchemy.orm import Session

from app.db.hierarchy.crud import HierarchyCrud
from app.db.models import BaseModel
from app.db.session import get_db


def rebuild_with_session():
    db: Session = get_db().__next__()
    HierarchyCrud.rebuild(db)
    db.commit()


if __name__ == "__main__":
    rebuild_with_session()
