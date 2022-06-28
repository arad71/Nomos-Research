#!/usr/bin/env python3

from app.db.models import BaseModel
from app.db.session import get_db
from app.model import Hierarchy



if __name__ == "__main__":
    BaseModel.set_session(get_db().__next__())
    Hierarchy.rebuild_hierarchy_paths()
