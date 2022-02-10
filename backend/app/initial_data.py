#!/usr/bin/env python3
from app.db.session import SessionLocal
from app.db.user.crud import create_user, get_user_by_email
from app.db.user.schema import UserCreate


def get_admin_email():
    return "admin@taxman.com"


def init() -> bool:
    admin_email = get_admin_email()
    db = SessionLocal()
    user = get_user_by_email(db=db, email=admin_email)
    if user is None:
        create_user(
            db,
            UserCreate(
                email=admin_email,
                password="password",
                is_active=True,
                is_superuser=True,
                first_name="Admin",
                last_name="User",
            ),
        )
        return True
    return False


if __name__ == "__main__":
    print("Initialising")
    created = init()
    print(
        "Superuser {} {}".format(get_admin_email(), "created" if created else "exists")
    )
