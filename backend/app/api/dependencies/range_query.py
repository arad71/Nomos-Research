from fastapi.params import Query

from app.core.config import settings

# RangeQueryParameter = Query(
#     f"[0,{settings.DEFAULT_PAGE_SIZE}]", regex=r"^\[\d+,\s*\d{1,4}\]$"
# )


RangeQueryParameter = Query(
    f"[0,{settings.DEFAULT_PAGE_SIZE}]",
    pattern=r"^\[\d+,\s*\d{1,4}\]$",
)
