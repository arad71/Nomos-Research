from __future__ import annotations

import re

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.taxon_name import calculated, schema
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name_parent.model import TaxonNameParent
from app.db.taxon_rank.enums import RankAbbreviationVals


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
HIGHER_RANK_INFRAGENERIC_NAMES = {
    "subgenus",
    "section",
    "subsection",
    "series",
    "subseries",
}
ALLOWED_PARENT_RANKS_BY_CHILD_RANK = {
    SPECIES_RANK_NAME: {"genus", "subgenus"},
    "subspecies": {"genus", "species", "subgenus"},
    "variety": {"genus", "species", "subgenus"},
    "subvariety": {"genus", "species", "subgenus"},
    "form": {"genus", "species", "subgenus"},
    "subform": {"genus", "species", "subgenus"},
    "subgenus": {"genus"},
    "section": {"genus"},
    "subsection": {"genus"},
    "series": {"genus"},
    "subseries": {"genus"},
}
BRACKETED_SCIENTIFIC_NAME_PATTERN = re.compile(r"^\S+\s+\(([^)]+)\)\s+")
LEADING_HYBRID_UNINOMIAL_PATTERN = re.compile(r"^(×|x|X)\s+(\S+)")


def generate_parallel_name_preview(
    db: Session,
    taxon_name_id: int,
    strict: bool = False,
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

    derived = derive_parallel_name(db, taxon_name, strict=strict)
    normalized_derived_uninomial = normalize_parallel_name_part(derived["uninomial"])
    normalized_derived_canonical_name = normalize_parallel_name_part(
        derived["canonical_name"]
    )
    normalized_derived_scientific_name = normalize_parallel_name_part(
        derived["scientific_name"]
    )
    normalized_derived_formatted_scientific_name = normalize_parallel_name_part(
        derived["formatted_scientific_name"]
    )

    return schema.TaxonNameParallelPreview(
        taxon_name_id=taxon_name.taxon_name_id,
        strategy=derived["strategy"],
        notes=derived["notes"],
        parent_taxon_name_ids=derived["parent_taxon_name_ids"],
        current_uninomial=taxon_name.uninomial,
        current_canonical_name=taxon_name.canonical_name,
        current_scientific_name=taxon_name.scientific_name,
        current_formatted_scientific_name=taxon_name.formatted_scientific_name,
        derived_uninomial=normalized_derived_uninomial,
        derived_canonical_name=normalized_derived_canonical_name,
        derived_scientific_name=normalized_derived_scientific_name,
        derived_formatted_scientific_name=normalized_derived_formatted_scientific_name,
        matches_current_uninomial=(taxon_name.uninomial or "")
        == (normalized_derived_uninomial or ""),
        matches_current_scientific_name=(taxon_name.scientific_name or "")
        == (normalized_derived_scientific_name or ""),
    )


def derive_parallel_name(
    db: Session,
    taxon_name: TaxonName,
    strict: bool = False,
) -> dict[str, object]:
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
    has_meaningful_uninomial_override = (
        taxon_name.parallel_override_uninomial is not None
        and taxon_name.parallel_override_uninomial != taxon_name.uninomial
    )
    has_meaningful_specific_epithet_override = (
        taxon_name.parallel_override_specific_epithet is not None
        and taxon_name.parallel_override_specific_epithet != taxon_name.specific_epithet
    )
    has_meaningful_infraspecific_epithet_override = (
        taxon_name.parallel_override_infraspecific_epithet is not None
        and taxon_name.parallel_override_infraspecific_epithet
        != taxon_name.infraspecific_epithet
    )
    has_meaningful_parallel_override = any(
        [
            has_meaningful_uninomial_override,
            has_meaningful_specific_epithet_override,
            has_meaningful_infraspecific_epithet_override,
        ]
    )

    if taxon_name.parallel_override_uninomial is not None:
        components.uninomial = taxon_name.parallel_override_uninomial
        if has_meaningful_uninomial_override:
            notes.append("Used the parallel uninomial field.")
    if taxon_name.parallel_override_specific_epithet is not None:
        components.specific_epithet = taxon_name.parallel_override_specific_epithet
        if has_meaningful_specific_epithet_override:
            notes.append("Used the parallel specific epithet field.")
    if taxon_name.parallel_override_infraspecific_epithet is not None:
        components.infraspecific_epithet = (
            taxon_name.parallel_override_infraspecific_epithet
        )
        if has_meaningful_infraspecific_epithet_override:
            notes.append("Used the parallel infraspecific epithet field.")
    ensure_rank_abbreviation_from_taxon(taxon_name=taxon_name, components=components)
    if (
        rank_name == SPECIES_RANK_NAME
        and bool(getattr(taxon_name, "is_hybrid", False))
        and getattr(getattr(taxon_name, "hybrid_category", None), "value", None)
        == "named_hybrid"
        and components.specific_epithet
    ):
        components.hybrid_marker_on_specific_epithet = True

    if (
        strict
        and rank_name in {SPECIES_RANK_NAME, *INFRASPECIFIC_RANK_NAMES}
        and not has_meaningful_uninomial_override
    ):
        current_scientific_uninomial = extract_current_scientific_uninomial(taxon_name)
        if (
            current_scientific_uninomial
            and current_scientific_uninomial != components.uninomial
        ):
            components.uninomial = current_scientific_uninomial
            notes.append(
                "Retained the current scientific-name genus/uninomial where the stored component fields differ."
            )

    if strict and not has_meaningful_specific_epithet_override and components.specific_epithet:
        if not current_name_contains_component(
            taxon_name,
            components.specific_epithet,
        ):
            components.specific_epithet = None
            notes.append(
                "Omitted the stored specific epithet because it is not present in the current name."
            )

    if (
        strict
        and not has_meaningful_infraspecific_epithet_override
        and components.infraspecific_epithet
    ):
        if not current_name_contains_component(
            taxon_name,
            components.infraspecific_epithet,
        ):
            components.infraspecific_epithet = None
            notes.append(
                "Omitted the stored infraspecific epithet because it is not present in the current name."
            )

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
        if not parent_rank_allowed_for_parallel_inheritance(
            child_rank_name=rank_name,
            parent_rank_name=parent_rank_name,
        ):
            notes.append(
                f"Ignored linked parent taxon {parent.taxon_name_id} because rank {parent_rank_name or 'unknown'} is not a valid inheritance source for child rank {rank_name or 'unknown'}."
            )
            parent_taxa = []
            parent = None

        if not parent:
            pass
        else:
            parent_rank_name = (
                (parent.rank_name or parent.taxon_rank.rank_name) or ""
            ).strip().lower()
            parent_is_infrageneric = parent_rank_name == "subgenus"
            current_uninomial = components.uninomial
            parent_conflicts_with_current_uninomial = (
                not parent_is_infrageneric
                and bool(parent.uninomial)
                and bool(current_uninomial)
                and parent.uninomial != current_uninomial
            )

            if parent_conflicts_with_current_uninomial:
                notes.append(
                    f"Retained the current genus/uninomial because linked parent taxon {parent.taxon_name_id} conflicts with the stored value."
                )
            elif not parent_is_infrageneric and not has_uninomial_override:
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
                    notes.append(
                        "Kept the child specific epithet and author while deriving the genus/uninomial from the linked parent."
                    )
            elif rank_name in INFRASPECIFIC_RANK_NAMES:
                strategy = (
                    "infrageneric_overlay"
                    if parent_is_infrageneric
                    else "single_parent_infraspecific_inheritance"
                )
                if (
                    not parent_is_infrageneric
                    and parent.specific_epithet
                    and taxon_name.specific_epithet
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
                    notes.append(
                        "Linked parent did not provide a specific epithet, so the child value was retained."
                    )

            if strict and parent_is_infrageneric and rank_name in {
                SPECIES_RANK_NAME,
                *INFRASPECIFIC_RANK_NAMES,
            }:
                strict_overlay_scientific_name = build_strict_infrageneric_overlay_name(
                    parent=parent,
                    components=components,
                    author=taxon_name.author,
                    italicize=False,
                )
                strict_overlay_formatted_scientific_name = build_strict_infrageneric_overlay_name(
                    parent=parent,
                    components=components,
                    author=taxon_name.author,
                    italicize=True,
                )
                if strict_overlay_scientific_name:
                    strategy = "strict_infrageneric_parent_overlay"
                    notes.append(
                        f"Built the infrageneric scientific name directly from linked parent taxon {parent.taxon_name_id} without using the legacy overlay fallback."
                    )
                    return {
                        "strategy": strategy,
                        "notes": notes,
                "parent_taxon_name_ids": [parent.taxon_name_id for parent in parent_taxa],
                "uninomial": components.uninomial,
                "canonical_name": calculated.calculate_canonical_name_string(
                    components
                ),
                "scientific_name": strict_overlay_scientific_name,
                "formatted_scientific_name": strict_overlay_formatted_scientific_name,
            }

    if (
        rank_name in HIGHER_RANK_INFRAGENERIC_NAMES
        and len(parent_taxa) == 1
    ):
        stored_bracketed_component = extract_stored_bracketed_scientific_component(
            taxon_name
        )
        normalized_stored_bracketed_component = normalize_higher_rank_infrageneric_component(
            stored_bracketed_component,
            rank_abbreviation=components.rank_abbreviation,
        )
        if (
            normalized_stored_bracketed_component
            and not has_meaningful_uninomial_override
        ):
            components.uninomial = normalized_stored_bracketed_component
        higher_rank_infrageneric = build_higher_rank_infrageneric_name(
            parent=parent_taxa[0],
            components=components,
            italicize=False,
        )
        higher_rank_infrageneric_formatted = build_higher_rank_infrageneric_name(
            parent=parent_taxa[0],
            components=components,
            italicize=True,
        )
        if higher_rank_infrageneric:
            strategy = "higher_rank_infrageneric_parent_inheritance"
            notes.append(
                f"Built the higher-rank infrageneric name from linked parent taxon {parent_taxa[0].taxon_name_id} and the parallel infrageneric fields."
            )
            return {
                "strategy": strategy,
                "notes": notes,
                "parent_taxon_name_ids": [parent.taxon_name_id for parent in parent_taxa],
                "uninomial": components.uninomial,
                "canonical_name": best_parent_name_value(parent_taxa[0], italicize=False),
                "scientific_name": higher_rank_infrageneric,
                "formatted_scientific_name": higher_rank_infrageneric_formatted,
            }

    if strict and rank_name in {SPECIES_RANK_NAME, *INFRASPECIFIC_RANK_NAMES}:
        stored_bracketed_scientific_name = build_strict_stored_bracketed_scientific_name(
            taxon_name=taxon_name,
            components=components,
            italicize=False,
        )
        stored_bracketed_formatted_scientific_name = (
            build_strict_stored_bracketed_scientific_name(
                taxon_name=taxon_name,
                components=components,
                italicize=True,
            )
        )
        if stored_bracketed_scientific_name:
            strategy = "strict_stored_bracketed_infrageneric_overlay"
            notes.append(
                "Built the infrageneric scientific name directly from the stored bracketed scientific-name component without using the legacy overlay fallback."
            )
            return {
                "strategy": strategy,
                "notes": notes,
                "parent_taxon_name_ids": [parent.taxon_name_id for parent in parent_taxa],
                "uninomial": components.uninomial,
                "canonical_name": calculated.calculate_canonical_name_string(
                    components
                ),
                "scientific_name": stored_bracketed_scientific_name,
                "formatted_scientific_name": stored_bracketed_formatted_scientific_name,
            }

    if strict and rank_name not in {SPECIES_RANK_NAME, *INFRASPECIFIC_RANK_NAMES}:
        components.rank_abbreviation = None

    if (
        strict
        and rank_name in INFRASPECIFIC_RANK_NAMES
        and components.specific_epithet
        and components.infraspecific_epithet
        and components.specific_epithet == components.infraspecific_epithet
    ):
        genus_only_infraspecific_form = current_name_matches_genus_only_infraspecific_form(
            taxon_name=taxon_name,
            components=components,
        )
        if genus_only_infraspecific_form:
            components.specific_epithet = None
            notes.append(
                "Retained the genus-only infraspecific form because the current name uses a rank-plus-epithet pattern without a distinct species epithet."
            )
        else:
            optional_rank_pattern = (
                rf"{re.escape(components.rank_abbreviation)}\s+"
                if components.rank_abbreviation
                else r"(?:\S+\s+)?"
            )
            current_name_values = [
                normalize_parallel_name_part(taxon_name.canonical_name),
                normalize_parallel_name_part(taxon_name.scientific_name),
            ]
            repeated_infraspecific_present = any(
                value
                and bool(
                    re.search(
                        rf"\b{re.escape(components.specific_epithet)}\b\s+"
                        rf"(?:{optional_rank_pattern})?"
                        rf"\b{re.escape(components.infraspecific_epithet)}\b",
                        value,
                    )
                )
                for value in current_name_values
            )
            if not repeated_infraspecific_present:
                components.rank_abbreviation = None
                components.infraspecific_epithet = None
                notes.append(
                    "Omitted the repeated infraspecific segment because the current name does not use a doubled species-style form."
                )

    derived_canonical_name = calculated.calculate_canonical_name_string(components)
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

    infrageneric_overlay = None if strict else get_infrageneric_overlay(db, taxon_name.taxon_name_id)
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
            if has_meaningful_parallel_override:
                notes.append(
                    "Retained the current canonical name for higher-rank infrageneric records while applying the parallel fields to the scientific-name overlay."
                )
            else:
                notes.append(
                    "Retained the current uninomial and canonical name for higher-rank infrageneric names while applying the scientific-name overlay."
                )
        overlay_scientific_name = infrageneric_overlay["scientific_name"]
        overlay_formatted_scientific_name = infrageneric_overlay["formatted_scientific_name"]
        if has_meaningful_parallel_override or components.is_hybrid_formula:
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
            if has_meaningful_parallel_override:
                notes.append(
                    "Applied the parallel field overrides to the infrageneric scientific-name overlay."
                )
            else:
                notes.append(
                    "Applied hybrid-formula semantics to the infrageneric scientific-name overlay."
                )
        derived_scientific_name = overlay_scientific_name or derived_scientific_name
        derived_formatted_scientific_name = (
            overlay_formatted_scientific_name or derived_formatted_scientific_name
        )
    elif strict:
        if rank_name not in {SPECIES_RANK_NAME, *INFRASPECIFIC_RANK_NAMES}:
            derived_canonical_name = calculated.calculate_canonical_name_string(
                components,
                include_rank=False,
            )
        notes.append(
            "Strict parallel mode disabled the legacy infrageneric overlay fallback."
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


def normalize_parallel_name_part(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = re.sub(r"\s+", " ", value).strip()
    return normalized or None


def parent_rank_allowed_for_parallel_inheritance(
    *,
    child_rank_name: str,
    parent_rank_name: str,
) -> bool:
    allowed_parent_ranks = ALLOWED_PARENT_RANKS_BY_CHILD_RANK.get(child_rank_name)
    if not allowed_parent_ranks:
        return False
    return parent_rank_name in allowed_parent_ranks


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
        best_parent_name_value(parent, italicize=False)
        for parent in parent_taxa
    ]
    parent_values = [value for value in parent_values if value]
    if not parent_values:
        return None
    parent_values = compact_same_genus_hybrid_parent_values(parent_values)
    if italicize:
        parent_values = [calculated.italicize_name(value) for value in parent_values]
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


def compact_same_genus_hybrid_parent_values(
    parent_values: list[str],
) -> list[str]:
    if len(parent_values) < 2:
        return parent_values

    compacted_values = [parent_values[0]]
    shared_genus = extract_leading_name_token(parent_values[0])
    if not shared_genus:
        return parent_values

    for index, parent_value in enumerate(parent_values[1:], start=1):
        if index == 1:
            compacted_values.append(
                remove_shared_leading_genus(parent_value, shared_genus) or parent_value
            )
        else:
            compacted_values.append(parent_value)
    return compacted_values


def extract_leading_name_token(value: str | None) -> str | None:
    normalized_value = normalize_parallel_name_part(value)
    if not normalized_value:
        return None
    match = re.match(r"^(\S+)", normalized_value)
    if not match:
        return None
    token = (match.group(1) or "").strip()
    return token or None


def remove_shared_leading_genus(
    value: str | None,
    shared_genus: str | None,
) -> str | None:
    normalized_value = normalize_parallel_name_part(value)
    if not normalized_value or not shared_genus:
        return normalized_value
    prefix = f"{shared_genus} "
    if not normalized_value.startswith(prefix):
        return normalized_value
    stripped_value = normalized_value[len(prefix):].strip()
    return stripped_value or normalized_value


def build_higher_rank_infrageneric_name(
    *,
    parent: TaxonName,
    components: schema.NameStringComponents,
    italicize: bool = False,
) -> str | None:
    parent_value = best_parent_name_value(parent, italicize=italicize)
    infrageneric_value = (
        calculated.italicize_name(components.uninomial)
        if italicize
        else components.uninomial
    )
    if not parent_value or not infrageneric_value:
        return None

    bracketed_component = calculated.filter_join(
        [components.rank_abbreviation, infrageneric_value]
    )
    main_name = f"{parent_value} ({bracketed_component})" if bracketed_component else parent_value
    return calculated.filter_join([main_name, components.author])


def build_strict_infrageneric_overlay_name(
    *,
    parent: TaxonName,
    components: schema.NameStringComponents,
    author: str | None,
    italicize: bool = False,
) -> str | None:
    genus_value = (
        calculated.italicize_name(components.uninomial)
        if italicize
        else components.uninomial
    )
    infrageneric_value = (
        calculated.italicize_name(parent.uninomial)
        if italicize
        else parent.uninomial
    )
    if not genus_value or not infrageneric_value:
        return None
    if components.uninomial == parent.uninomial:
        return None

    rank_abbrev = None
    parent_rank_abbrev = getattr(getattr(parent, "taxon_rank", None), "rank_abbrev", None)
    if parent_rank_abbrev:
        rank_abbrev = RankAbbreviationVals.get(parent_rank_abbrev, f"{parent_rank_abbrev}.")
    bracketed_component = calculated.filter_join([rank_abbrev, infrageneric_value])
    head = f"{genus_value} ({bracketed_component})" if bracketed_component else genus_value

    specific_epithet = (
        calculated.italicize_name(components.specific_epithet)
        if italicize
        else components.specific_epithet
    )
    infraspecific_epithet = (
        calculated.italicize_name(components.infraspecific_epithet)
        if italicize
        else components.infraspecific_epithet
    )

    return calculated.filter_join(
        [
            head,
            specific_epithet,
            components.rank_abbreviation,
            infraspecific_epithet,
            author,
        ]
    )


def ensure_rank_abbreviation_from_taxon(
    *,
    taxon_name: TaxonName,
    components: schema.NameStringComponents,
) -> None:
    if components.rank_abbreviation:
        return

    rank_abbrev = getattr(getattr(taxon_name, "taxon_rank", None), "rank_abbrev", None)
    if not rank_abbrev:
        return

    components.rank_abbreviation = RankAbbreviationVals.get(
        rank_abbrev,
        f"{rank_abbrev}.",
    )


def extract_stored_bracketed_scientific_component(
    taxon_name: TaxonName,
) -> str | None:
    scientific_name = (taxon_name.scientific_name or "").strip()
    if not scientific_name:
        return None

    match = BRACKETED_SCIENTIFIC_NAME_PATTERN.match(scientific_name)
    if not match:
        return None

    bracketed_component = (match.group(1) or "").strip()
    return bracketed_component or None


def normalize_higher_rank_infrageneric_component(
    component: str | None,
    *,
    rank_abbreviation: str | None,
) -> str | None:
    normalized_component = normalize_parallel_name_part(component)
    if not normalized_component:
        return None
    if rank_abbreviation:
        prefix = f"{rank_abbreviation} "
        if normalized_component.startswith(prefix):
            stripped_component = normalized_component[len(prefix):].strip()
            if stripped_component:
                return stripped_component
    return normalized_component


def extract_current_scientific_uninomial(
    taxon_name: TaxonName,
) -> str | None:
    scientific_name = normalize_parallel_name_part(taxon_name.scientific_name)
    if not scientific_name:
        return None

    hybrid_match = LEADING_HYBRID_UNINOMIAL_PATTERN.match(scientific_name)
    if hybrid_match:
        uninomial = hybrid_match.group(2)
        return uninomial.strip() or None

    match = re.match(r"^(\S+)", scientific_name)
    if not match:
        return None

    uninomial = (match.group(1) or "").strip()
    return uninomial or None


def current_name_contains_component(
    taxon_name: TaxonName,
    component: str | None,
) -> bool:
    if not component:
        return False

    normalized_component = normalize_parallel_name_part(component)
    if not normalized_component:
        return False

    candidate_components = [normalized_component]
    stripped_hybrid_component = calculated.strip_hybrid_formula_prefix(normalized_component)
    if stripped_hybrid_component and stripped_hybrid_component != normalized_component:
        candidate_components.append(f"×{stripped_hybrid_component}")
        candidate_components.append(f"× {stripped_hybrid_component}")

    current_name_values = [
        normalize_parallel_name_part(taxon_name.canonical_name),
        normalize_parallel_name_part(taxon_name.scientific_name),
    ]
    return any(
        bool(
            value
            and any(
                re.compile(rf"(?<!\\w){re.escape(candidate)}(?!\\w)").search(value)
                for candidate in candidate_components
            )
        )
        for value in current_name_values
    )


def TaxonNameCrudLike_has_hybrid_prefix(value: str | None) -> bool:
    normalized_value = normalize_parallel_name_part(value)
    if not normalized_value:
        return False
    return bool(re.match(r"^(?:×|x|X)\s+", normalized_value))


def current_name_matches_genus_only_infraspecific_form(
    *,
    taxon_name: TaxonName,
    components: schema.NameStringComponents,
) -> bool:
    uninomial = normalize_parallel_name_part(components.uninomial)
    rank_abbreviation = normalize_parallel_name_part(components.rank_abbreviation)
    infraspecific_epithet = normalize_parallel_name_part(components.infraspecific_epithet)
    if not uninomial or not rank_abbreviation or not infraspecific_epithet:
        return False

    canonical_name = normalize_parallel_name_part(taxon_name.canonical_name)
    if canonical_name == calculated.filter_join(
        [uninomial, rank_abbreviation, infraspecific_epithet]
    ):
        return True

    author = normalize_parallel_name_part(taxon_name.author)
    scientific_name = normalize_parallel_name_part(taxon_name.scientific_name)
    if scientific_name and author:
        return scientific_name == calculated.filter_join(
            [uninomial, author, rank_abbreviation, infraspecific_epithet]
        )

    return False


def build_strict_stored_bracketed_scientific_name(
    *,
    taxon_name: TaxonName,
    components: schema.NameStringComponents,
    italicize: bool = False,
) -> str | None:
    genus_value = components.uninomial
    bracketed_component = extract_stored_bracketed_scientific_component(taxon_name)
    if not genus_value or not bracketed_component:
        return None

    if italicize:
        genus_value = calculated.italicize_name(genus_value)

    head = f"{genus_value} ({bracketed_component})"
    specific_epithet = components.specific_epithet
    if specific_epithet and bracketed_specific_matches_stored_infrageneric_component(
        specific_epithet=specific_epithet,
        bracketed_component=bracketed_component,
    ):
        specific_epithet = None

    specific_epithet = (
        calculated.italicize_name(specific_epithet)
        if italicize
        else specific_epithet
    )
    infraspecific_epithet = (
        calculated.italicize_name(components.infraspecific_epithet)
        if italicize
        else components.infraspecific_epithet
    )

    return calculated.filter_join(
        [
            head,
            specific_epithet,
            components.rank_abbreviation,
            infraspecific_epithet,
            components.author,
        ]
    )


def bracketed_specific_matches_stored_infrageneric_component(
    *,
    specific_epithet: str | None,
    bracketed_component: str | None,
) -> bool:
    normalized_specific_epithet = normalize_parallel_name_part(specific_epithet)
    normalized_bracketed_component = normalize_parallel_name_part(bracketed_component)
    if not normalized_specific_epithet or not normalized_bracketed_component:
        return False

    match = re.fullmatch(r"\(([^)]+)\)", normalized_specific_epithet)
    if not match:
        return False

    bracketed_specific = normalize_parallel_name_part(match.group(1))
    return bracketed_specific == normalized_bracketed_component


def apply_components_to_overlay_name(
    overlay_name: str | None,
    taxon_name: TaxonName,
    components: schema.NameStringComponents,
    italicize: bool = False,
) -> str | None:
    if not overlay_name:
        return None

    updated_name = overlay_name
    current_uninomial = taxon_name.uninomial
    current_is_hybrid_formula = (
        bool(getattr(taxon_name, "is_hybrid", False))
        and getattr(getattr(taxon_name, "hybrid_category", None), "value", None)
        == "hybrid_formula"
    )
    current_uninomial_display = calculated.format_uninomial_for_display(
        current_uninomial,
        is_hybrid_formula=current_is_hybrid_formula,
        italicize=italicize,
    )
    raw_current_uninomial_display = (
        calculated.italicize_name(current_uninomial) if italicize else current_uninomial
    )
    derived_uninomial_display = calculated.format_uninomial_for_display(
        components.uninomial,
        is_hybrid_formula=components.is_hybrid_formula,
        italicize=italicize,
    )

    for current_display in [current_uninomial_display, raw_current_uninomial_display]:
        if (
            current_display
            and derived_uninomial_display
            and updated_name.startswith(current_display)
            and current_display != derived_uninomial_display
        ):
            updated_name = (
                derived_uninomial_display + updated_name[len(current_display):]
            )
            break

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
