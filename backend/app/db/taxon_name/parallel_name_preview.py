from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.taxon_name import calculated, schema
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name_parent.model import TaxonNameParent


SPECIES_RANK_NAME = "species"
INFRASPECIFIC_RANK_NAMES = {
    "subspecies",
    "variety",
    "subvariety",
    "form",
    "subform",
}
HYBRID_SEPARATOR_BY_CATEGORY = {
    "intergrade": " - ",
}


def generate_parallel_name_preview(
    db: Session,
    taxon_name_id: int,
) -> schema.TaxonNameParallelPreview:
    taxon_name = (
        db.query(TaxonName)
        .options(
            joinedload(TaxonName.kingdom),
            joinedload(TaxonName.taxon_rank),
            joinedload(TaxonName.taxon_name_parents)
            .joinedload(TaxonNameParent.parent_taxon_name)
            .joinedload(TaxonName.kingdom),
            joinedload(TaxonName.taxon_name_parents)
            .joinedload(TaxonNameParent.parent_taxon_name)
            .joinedload(TaxonName.taxon_rank),
        )
        .filter(
            TaxonName.deleted == False,  # noqa: E712
            TaxonName.taxon_name_id == taxon_name_id,
        )
        .first()
    )
    if not taxon_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Taxon ID {taxon_name_id} not found",
        )

    derived = derive_parallel_name(db, taxon_name)
    return schema.TaxonNameParallelPreview(
        taxon_name_id=taxon_name.taxon_name_id,
        strategy=derived["strategy"],
        notes=derived["notes"],
        parent_taxon_name_ids=derived["parent_taxon_name_ids"],
        current_uninomial=taxon_name.uninomial,
        current_canonical_name=taxon_name.canonical_name,
        current_scientific_name=taxon_name.scientific_name,
        current_formatted_scientific_name=taxon_name.formatted_scientific_name,
        derived_uninomial=derived["uninomial"],
        derived_canonical_name=derived["canonical_name"],
        derived_scientific_name=derived["scientific_name"],
        derived_formatted_scientific_name=derived["formatted_scientific_name"],
        matches_current_uninomial=(taxon_name.uninomial or "") == (derived["uninomial"] or ""),
        matches_current_scientific_name=(taxon_name.scientific_name or "")
        == (derived["scientific_name"] or ""),
    )


def derive_parallel_name(db: Session, taxon_name: TaxonName) -> dict[str, object]:
    notes: list[str] = []
    strategy = "stored_fields"
    components = calculated.get_name_components(taxon_name)
    parent_taxa = ordered_parent_taxa(taxon_name)
    rank_name = ((taxon_name.rank_name or taxon_name.taxon_rank.rank_name) or "").strip().lower()

    if parent_taxa:
        if len(parent_taxa) >= 2:
            strategy = "hybrid_parent_formula"
            notes.append("Derived from ordered parent links using the current hybrid separator rules.")
            return {
                "strategy": strategy,
                "notes": notes,
                "parent_taxon_name_ids": [parent.taxon_name_id for parent in parent_taxa],
                "uninomial": join_parent_names(taxon_name, parent_taxa),
                "canonical_name": join_parent_names(taxon_name, parent_taxa),
                "scientific_name": join_parent_names(taxon_name, parent_taxa),
                "formatted_scientific_name": join_parent_names(taxon_name, parent_taxa, italicize=True),
            }

        parent = parent_taxa[0]
        components.uninomial = parent.uninomial or components.uninomial
        notes.append(
            f"Inherited uninomial from linked parent taxon {parent.taxon_name_id}."
        )

        if rank_name == SPECIES_RANK_NAME:
            strategy = "single_parent_species_inheritance"
            notes.append("Kept the child specific epithet and author while deriving the genus/uninomial from the linked parent.")
        elif rank_name in INFRASPECIFIC_RANK_NAMES:
            strategy = "single_parent_infraspecific_inheritance"
            if parent.specific_epithet:
                components.specific_epithet = parent.specific_epithet
                notes.append(
                    f"Inherited specific epithet from linked parent taxon {parent.taxon_name_id}."
                )
            else:
                notes.append("Linked parent did not provide a specific epithet, so the child value was retained.")

    derived_canonical_name = calculated.filter_join(
        [
            components.uninomial,
            components.specific_epithet,
            components.rank_abbreviation,
            components.infraspecific_epithet,
        ]
    )
    derived_scientific_name = calculated.calculate_scientific_name_string(
        components=components,
        is_autonym=taxon_name.is_autonym,
        italicize=False,
    )
    derived_formatted_scientific_name = calculated.calculate_scientific_name_string(
        components=components,
        is_autonym=taxon_name.is_autonym,
        italicize=True,
    )

    infrageneric_overlay = get_infrageneric_overlay(db, taxon_name.taxon_name_id)
    if infrageneric_overlay:
        strategy = (
            "parent_inheritance_with_infrageneric_overlay"
            if parent_taxa
            else "infrageneric_overlay"
        )
        notes.append(
            "Applied the current infrageneric formatter as a parallel overlay for bracketed or hierarchy-derived name parts."
        )
        derived_scientific_name = infrageneric_overlay["scientific_name"] or derived_scientific_name
        derived_formatted_scientific_name = (
            infrageneric_overlay["formatted_scientific_name"] or derived_formatted_scientific_name
        )

    return {
        "strategy": strategy,
        "notes": notes,
        "parent_taxon_name_ids": [parent.taxon_name_id for parent in parent_taxa],
        "uninomial": components.uninomial,
        "canonical_name": derived_canonical_name,
        "scientific_name": derived_scientific_name,
        "formatted_scientific_name": derived_formatted_scientific_name,
    }


def ordered_parent_taxa(taxon_name: TaxonName) -> list[TaxonName]:
    parent_rows = sorted(
        [
            row
            for row in getattr(taxon_name, "taxon_name_parents", [])
            if not row.deleted and row.parent_taxon_name and not row.parent_taxon_name.deleted
        ],
        key=lambda row: (row.sequence, row.parent_taxon_name_id),
    )
    return [row.parent_taxon_name for row in parent_rows]


def join_parent_names(
    taxon_name: TaxonName,
    parent_taxa: list[TaxonName],
    italicize: bool = False,
) -> str | None:
    separator = HYBRID_SEPARATOR_BY_CATEGORY.get(
        taxon_name.hybrid_category.value if taxon_name.hybrid_category else None,
        " × ",
    )
    parent_values = [
        best_parent_name_value(parent, italicize=italicize)
        for parent in parent_taxa
    ]
    parent_values = [value for value in parent_values if value]
    if not parent_values:
        return None
    return separator.join(parent_values)


def best_parent_name_value(parent: TaxonName, italicize: bool = False) -> str | None:
    value = (
        parent.infragenus_name
        or parent.canonical_name_without_rank
        or parent.canonical_name
        or parent.uninomial
    )
    if not value:
        return None
    return calculated.italicize_name(value) if italicize else value


def get_infrageneric_overlay(
    db: Session,
    taxon_name_id: int,
) -> dict[str, str | None] | None:
    from app.db.taxon_name.crud import INFRAGENUS_WITH_RANK, TaxonNameCrud

    try:
        infrageneric_names = TaxonNameCrud.generate_infrageneric_names(db, taxon_name_id)
    except HTTPException:
        return None

    for entry in infrageneric_names:
        if entry.name_version == INFRAGENUS_WITH_RANK:
            return {
                "scientific_name": entry.formatted_name_with_author or entry.formatted_name,
                "formatted_scientific_name": entry.italicized_name,
            }
    return None
