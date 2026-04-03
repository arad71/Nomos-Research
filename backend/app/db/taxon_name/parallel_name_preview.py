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
    has_uninomial_override = bool(taxon_name.parallel_override_uninomial)
    has_specific_epithet_override = bool(taxon_name.parallel_override_specific_epithet)
    has_infraspecific_epithet_override = bool(
        taxon_name.parallel_override_infraspecific_epithet
    )

    if taxon_name.parallel_override_uninomial is not None:
        components.uninomial = taxon_name.parallel_override_uninomial
        if taxon_name.parallel_override_uninomial != taxon_name.uninomial:
            notes.append("Used the parallel uninomial field.")
    if taxon_name.parallel_override_specific_epithet is not None:
        components.specific_epithet = taxon_name.parallel_override_specific_epithet
        if taxon_name.parallel_override_specific_epithet != taxon_name.specific_epithet:
            notes.append("Used the parallel specific epithet field.")
    if taxon_name.parallel_override_infraspecific_epithet is not None:
        components.infraspecific_epithet = (
            taxon_name.parallel_override_infraspecific_epithet
        )
        if (
            taxon_name.parallel_override_infraspecific_epithet
            != taxon_name.infraspecific_epithet
        ):
            notes.append("Used the parallel infraspecific epithet field.")

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
        parent_rank_name = ((parent.rank_name or parent.taxon_rank.rank_name) or "").strip().lower()
        parent_is_infrageneric = parent_rank_name == "subgenus"

        if not parent_is_infrageneric and not has_uninomial_override:
            components.uninomial = parent.uninomial or components.uninomial
            notes.append(
                f"Inherited uninomial from linked parent taxon {parent.taxon_name_id}."
            )
        elif parent_is_infrageneric:
            notes.append(
                f"Linked parent taxon {parent.taxon_name_id} is treated as an infrageneric component, so the current genus/uninomial was retained."
            )
        else:
            notes.append(
                f"Retained the parallel uninomial field instead of inheriting uninomial from linked parent taxon {parent.taxon_name_id}."
            )

        if rank_name == SPECIES_RANK_NAME:
            strategy = (
                "infrageneric_overlay"
                if parent_is_infrageneric
                else "single_parent_species_inheritance"
            )
            if parent_is_infrageneric:
                notes.append(
                    "Kept the child specific epithet and author while using the linked parent only for infrageneric scientific-name context."
                )
            else:
                notes.append("Kept the child specific epithet and author while deriving the genus/uninomial from the linked parent.")
        elif rank_name in INFRASPECIFIC_RANK_NAMES:
            strategy = (
                "infrageneric_overlay"
                if parent_is_infrageneric
                else "single_parent_infraspecific_inheritance"
            )
            if (
                not parent_is_infrageneric
                and parent.specific_epithet
                and not has_specific_epithet_override
            ):
                components.specific_epithet = parent.specific_epithet
                notes.append(
                    f"Inherited specific epithet from linked parent taxon {parent.taxon_name_id}."
                )
            elif not parent_is_infrageneric and has_specific_epithet_override:
                notes.append(
                    f"Retained the parallel specific epithet field instead of inheriting from linked parent taxon {parent.taxon_name_id}."
                )
            elif not parent_is_infrageneric:
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
        if rank_name not in {SPECIES_RANK_NAME, *INFRASPECIFIC_RANK_NAMES}:
            if not has_uninomial_override:
                components.uninomial = taxon_name.uninomial or components.uninomial
            components.rank_abbreviation = None
            derived_canonical_name = taxon_name.canonical_name or derived_canonical_name
            if has_uninomial_override or has_specific_epithet_override or has_infraspecific_epithet_override:
                notes.append(
                    "Retained the current canonical name for higher-rank infrageneric records while applying the parallel fields to the scientific-name overlay."
                )
            else:
                notes.append(
                    "Retained the current uninomial and canonical name for higher-rank infrageneric names while applying the scientific-name overlay."
                )
        overlay_scientific_name = infrageneric_overlay["scientific_name"]
        overlay_formatted_scientific_name = infrageneric_overlay["formatted_scientific_name"]
        if has_uninomial_override or has_specific_epithet_override or has_infraspecific_epithet_override:
            overlay_scientific_name = apply_components_to_overlay_name(
                overlay_scientific_name,
                taxon_name=taxon_name,
                components=components,
            )
            overlay_formatted_scientific_name = apply_components_to_overlay_name(
                overlay_formatted_scientific_name,
                taxon_name=taxon_name,
                components=components,
                italicize=True,
            )
            notes.append(
                "Applied the parallel overrides to the infrageneric scientific-name overlay."
            )
        derived_scientific_name = overlay_scientific_name or derived_scientific_name
        derived_formatted_scientific_name = (
            overlay_formatted_scientific_name or derived_formatted_scientific_name
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


def apply_components_to_overlay_name(
    overlay_name: str | None,
    taxon_name: TaxonName,
    components: schema.NameStringComponents,
    italicize: bool = False,
) -> str | None:
    if not overlay_name:
        return None

    updated_name = overlay_name
    replacements = [
        (
            taxon_name.uninomial,
            calculated.italicize_name(components.uninomial) if italicize else components.uninomial,
        ),
        (
            taxon_name.specific_epithet,
            calculated.italicize_name(components.specific_epithet) if italicize else components.specific_epithet,
        ),
        (
            taxon_name.infraspecific_epithet,
            calculated.italicize_name(components.infraspecific_epithet) if italicize else components.infraspecific_epithet,
        ),
    ]

    for current_value, derived_value in replacements:
        if current_value and derived_value and current_value != derived_value:
            updated_name = updated_name.replace(current_value, derived_value, 1)

    return updated_name


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
