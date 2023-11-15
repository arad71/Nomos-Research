"""Add Role and User Role tables.

Revision ID: 3c31cbd94af9
Revises: 1f341cfdfd41
Create Date: 2022-03-16 06:27:35.522070-07:00

"""

from typing import Any, Generator

import sqlalchemy as sa

# revision identifiers, used by Alembic.
from fastapi import Depends
from loguru import logger
from sqlalchemy import update
from sqlalchemy.orm import Session

from alembic import op
from app.core.config import settings
from app.db.role.constants import Role
from app.db.session import SessionLocal, get_db
from app.db.user.model import User
from app.db.user_role.crud import UserRoleCrud
from app.db.user_role.model import UserRole

revision = "3c31cbd94af9"
down_revision = "1f341cfdfd41"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "role",
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("role_id"),
    )
    op.create_table_comment(
        "role",
        "List of roles available in the system.",
        existing_comment=None,
        schema=None,
    )
    op.create_index(op.f("ix_role_name"), "role", ["name"], unique=False)
    op.create_table(
        "user_role",
        sa.Column("user_role_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["role_id"],
            ["role.role_id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.user_id"],
        ),
        sa.PrimaryKeyConstraint("user_role_id"),
    )
    op.create_unique_constraint("unique_user_role", "user_role", ["user_id", "role_id"])
    op.drop_column("user", "is_superuser")


def downgrade():
    op.drop_constraint("unique_user_role", "user_role", type_="unique")
    op.add_column(
        "user",
        sa.Column("is_superuser", sa.BOOLEAN(), autoincrement=False, nullable=True),
    )
    op.execute("""
UPDATE "user"
SET is_superuser = TRUE
WHERE user_id IN (SELECT DISTINCT user_id
                  FROM user_role
                           JOIN role r on user_role.role_id = r.role_id
                  WHERE r.name = 'SUPER_ADMIN'
                  )
    """)
    op.execute('UPDATE "user" SET is_superuser = FALSE WHERE is_superuser IS NULL')
    op.alter_column("user", "is_superuser", nullable=False)
    op.drop_table("user_role")
    op.drop_index(op.f("ix_role_name"), table_name="role")
    op.drop_table("role")
