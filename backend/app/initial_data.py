#!/usr/bin/env python3

from app.db.init_db import init_db
from app.db.session import SessionLocal

if __name__ == "__main__":
    init_db(SessionLocal())
