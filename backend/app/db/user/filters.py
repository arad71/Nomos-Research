from sqlalchemy_filters import Field, Filter
from sqlalchemy_filters.operators import EqualsOperator

from app.db.session import get_db
from app.db.user.model import User


class EmailFilter(Filter):
    email = Field(lookup_operator=EqualsOperator)

    class Meta:
        model = User
        session = get_db()
