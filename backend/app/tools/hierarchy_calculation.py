#!/usr/bin/env python3
from sqlalchemy.orm import Session

from app.db.hierarchy.crud import HierarchyCrud
from app.db.models import BaseModel
from app.db.session import get_db

if __name__ == "__main__":
    db: Session = get_db().__next__()
    BaseModel.set_session(db)
    HierarchyCrud.rebuild()
    db.commit()
