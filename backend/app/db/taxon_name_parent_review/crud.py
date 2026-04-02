import app.db.crud as crud
from app.db.taxon_name_parent_review.model import (
    TaxonNameParentReview as TaxonNameParentReviewModel,
)


class TaxonNameParentReviewCrud(crud.Crud):
    model = TaxonNameParentReviewModel
    id_key = "taxon_name_parent_review_id"
    name = "Taxon name parent review"
    search_fields = [
        "taxon_name___scientific_name",
        "legacy_uninomial",
        "candidate_parent_names",
        "status",
        "reason",
    ]

