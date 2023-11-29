#!/usr/bin/env python3
from typing import Optional

import typer
from sqlalchemy.orm import Session

import app.db.taxon_name.crud as crud
import app.model  # noqa F401
from app.db.session import get_db


def recalculate_taxon_names_with_session(
    taxon_name_id: Optional[int] = None, limit: Optional[int] = None, offset: int = 0
):
    db: Session = get_db().__next__()
    crud.TaxonNameCrud.calculate_name_formats(
        db=db,
        taxon_name_id=taxon_name_id,
        limit=limit,
        offset=offset,
        use_fallback=True,
    )

    db.commit()


if __name__ == "__main__":
    typer.run(recalculate_taxon_names_with_session)
