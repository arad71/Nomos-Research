#!/usr/bin/env python3
from app.db.hierarchy.crud import HierarchyCrud
from app.db.session import get_db

if __name__ == "__main__":
    HierarchyCrud.rebuild(get_db().__next__())
