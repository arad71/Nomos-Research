from fastapi.params import Query

from app.core.config import settings

RangeQueryParameter = Query(
    f"[0,{settings.DEFAULT_PAGE_SIZE}]", regex=r"^\[\d+,\s*\d+\]$"
)
