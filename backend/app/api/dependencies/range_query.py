from fastapi.params import Query

from app.core.config import DEFAULT_PAGE_SIZE

RangeQueryParameter = Query(f"[0,{DEFAULT_PAGE_SIZE}]", regex=r"^\[\d+,\s*\d+\]$")
