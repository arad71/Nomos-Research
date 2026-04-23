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
    components = schema.NameStringComponents(
        author=taxon_name.author,
        is_hybrid_formula=(
            bool(getattr(taxon_name, "is_hybrid", False))
            and getattr(getattr(taxon_name, "hybrid_category", None), "value", None)
            == "hybrid_formula"
        ),
    )
    parent_taxa = ordered_parent_taxa(taxon_name)
    rank_name = (
        ((taxon_name.rank_name or taxon_name.taxon_rank.rank_name) or "")
        .strip()
        .lower()
    )
    has_uninomial_override = taxon_name.parallel_override_uninomial is not None
    has_specific_epithet_override = (
        taxon_name.parallel_override_specific_epithet is not None
    )
    has_infraspecific_epithet_override = (
        taxon_name.parallel_override_infraspecific_epithet is not None
    )
    has_meaningful_uninomial_override = has_uninomial_override
    has_meaningful_specific_epithet_override = has_specific_epithet_override
    has_meaningful_infraspecific_epithet_override = has_infraspecific_epithet_override
    has_meaningful_parallel_override = any(
        [
            has_meaningful_uninomial_override,
            has_meaningful_specific_epithet_override,
            has_meaningful_infraspecific_epithet_override,
        ]
    )
    has_explicit_parallel_uninomial_override = (
        taxon_name.parallel_override_uninomial is not None
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

    if rank_name in INFRASPECIFIC_RANK_NAMES:
        inferred_from_parallel_specific = False
        if has_specific_epithet_override and not has_infraspecific_epithet_override:
            components.infraspecific_epithet = components.specific_epithet
            inferred_from_parallel_specific = True
            notes.append(
                "Used the parallel specific epithet field as the infraspecific epithet because no parallel infraspecific epithet override is set."
            )
        if taxon_name.parallel_override_specific_epithet is None:
            components.specific_epithet = None
        if (
            taxon_name.parallel_override_infraspecific_epithet is None
            and not inferred_from_parallel_specific
        ):
            components.infraspecific_epithet = None

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
        rank_name in INFRASPECIFIC_RANK_NAMES
        and bool(getattr(taxon_name, "is_hybrid", False))
        and getattr(getattr(taxon_name, "hybrid_category", None), "value", None)
        == "named_hybrid"
        and components.infraspecific_epithet
    ):
        components.hybrid_marker_on_infraspecific_epithet = True

    # Parallel derivation intentionally avoids current-name alignment checks.

    if parent_taxa:
        if len(parent_taxa) == 1 and has_explicit_parallel_uninomial_override:
            notes.append(
                "Skipped linked single-parent uninomial inheritance because an explicit parallel uninomial value is present."
            )

    if parent_taxa:
        if len(parent_taxa) >= 2:
            is_named_hybrid = (
                bool(getattr(taxon_name, "is_hybrid", False))
                and getattr(getattr(taxon_name, "hybrid_category", None), "value", None)
                == "named_hybrid"
            )
            if is_named_hybrid and rank_name in {
                SPECIES_RANK_NAME,
                *INFRASPECIFIC_RANK_NAMES,
            }:
                strategy = "named_hybrid_parent_genus_inheritance"
                first_parent = parent_taxa[0]
                first_parent_value = (
                    normalize_parallel_name_part(first_parent.uninomial)
                    or normalize_parallel_name_part(
                        best_parent_name_value(first_parent, italicize=False)
                    )
                    or normalize_parallel_name_part(first_parent.scientific_name)
                    or normalize_parallel_name_part(first_parent.canonical_name)
                )
                parent_genus = extract_leading_name_token(first_parent_value)
                if parent_genus:
                    components.uninomial = parent_genus
                    notes.append(
                        f"Derived named-hybrid genus from the first linked parent taxon {first_parent.taxon_name_id}."
                    )
                else:
                    notes.append(
                        f"Could not derive a genus token from the first linked parent taxon {first_parent.taxon_name_id}; kept the current parallel uninomial value."
                    )
                notes.append(
                    "Retained the child epithet and author while using parent links only to determine named-hybrid lineage."
                )
                derived_canonical_name = calculated.calculate_canonical_name_string(
                    components
                )
                derived_scientific_name = calculated.calculate_scientific_name_string(
                    components=components,
                    is_autonym=taxon_name.is_autonym,
                    italicize=False,
                )
                derived_formatted_scientific_name = (
                    calculated.calculate_scientific_name_string(
                        components=components,
                        is_autonym=taxon_name.is_autonym,
                        italicize=True,
                    )
                )
                return {
                    "strategy": strategy,
                    "notes": notes,
                    "parent_taxon_name_ids": [
                        parent.taxon_name_id for parent in parent_taxa
                    ],
                    "uninomial": components.uninomial,
                    "canonical_name": derived_canonical_name,
                    "scientific_name": derived_scientific_name,
                    "formatted_scientific_name": derived_formatted_scientific_name,
                }
            strategy = "hybrid_parent_formula"
            notes.append(
                "Derived from ordered parent links using the current hybrid separator rules."
            )
            parent_formula_canonical = join_parent_names(taxon_name, parent_taxa)
            parent_formula_scientific = calculated.filter_join(
                [parent_formula_canonical, taxon_name.author]
            )
            parent_formula_scientific_formatted = calculated.filter_join(
                [
                    join_parent_names(taxon_name, parent_taxa, italicize=True),
                    taxon_name.author,
                ]
            )
            return {
                "strategy": strategy,
                "notes": notes,
                "parent_taxon_name_ids": [
                    parent.taxon_name_id for parent in parent_taxa
                ],
                "uninomial": parent_formula_canonical,
                "canonical_name": parent_formula_canonical,
                "scientific_name": parent_formula_scientific,
                "formatted_scientific_name": parent_formula_scientific_formatted,
            }

        parent = parent_taxa[0]
        parent_rank_name = (
            ((parent.rank_name or parent.taxon_rank.rank_name) or "").strip().lower()
        )
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
                ((parent.rank_name or parent.taxon_rank.rank_name) or "")
                .strip()
                .lower()
            )
            parent_is_infrageneric = parent_rank_name == "subgenus"
            inherited_uninomial_from_parent = False
            if not parent_is_infrageneric and not has_uninomial_override:
                if parent.uninomial:
                    components.uninomial = parent.uninomial
                    inherited_uninomial_from_parent = True
                    notes.append(
                        f"Inherited uninomial from linked parent taxon {parent.taxon_name_id}."
                    )
                else:
                    notes.append(
                        f"Linked parent taxon {parent.taxon_name_id} has no uninomial, so the current genus/uninomial was retained."
                    )
            elif parent_is_infrageneric:
                notes.append(
                    f"Linked parent taxon {parent.taxon_name_id} is treated as an infrageneric component, so the current genus/uninomial was retained."
                )
                if not components.uninomial:
                    inferred_overlay_uninomial = (
                        derive_overlay_uninomial_from_infrageneric_parent(parent)
                    )
                    if inferred_overlay_uninomial:
                        components.uninomial = inferred_overlay_uninomial
                        notes.append(
                            f"Derived the overlay genus/uninomial from linked parent taxon {parent.taxon_name_id}."
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
                elif inherited_uninomial_from_parent:
                    notes.append(
                        "Kept the child specific epithet and author while deriving the genus/uninomial from the linked parent."
                    )
                else:
                    notes.append(
                        "Kept the child specific epithet and author while retaining the child genus/uninomial."
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
                    and not has_specific_epithet_override
                ):
                    components.specific_epithet = parent.specific_epithet
                    notes.append(
                        f"Inherited specific epithet from linked parent taxon {parent.taxon_name_id}."
                    )
                    if (
                        not has_infraspecific_epithet_override
                        and not components.infraspecific_epithet
                    ):
                        components.infraspecific_epithet = parent.specific_epithet
                        notes.append(
                            f"Inherited infraspecific epithet from linked parent taxon {parent.taxon_name_id}."
                        )
                elif not parent_is_infrageneric and has_specific_epithet_override:
                    notes.append(
                        f"Retained the parallel specific epithet field instead of inheriting from linked parent taxon {parent.taxon_name_id}."
                    )
                elif not parent_is_infrageneric:
                    notes.append(
                        "Linked parent did not provide a specific epithet and no parallel specific epithet override is set."
                    )

            if (
                strict
                and parent_is_infrageneric
                and rank_name
                in {
                    SPECIES_RANK_NAME,
                    *INFRASPECIFIC_RANK_NAMES,
                }
            ):
                strict_overlay_scientific_name = build_strict_infrageneric_overlay_name(
                    parent=parent,
                    components=components,
                    author=taxon_name.author,
                    italicize=False,
                )
                strict_overlay_formatted_scientific_name = (
                    build_strict_infrageneric_overlay_name(
                        parent=parent,
                        components=components,
                        author=taxon_name.author,
                        italicize=True,
                    )
                )
                if strict_overlay_scientific_name:
                    strategy = "strict_infrageneric_parent_overlay"
                    notes.append(
                        f"Built the infrageneric scientific name directly from linked parent taxon {parent.taxon_name_id} without using the legacy overlay fallback."
                    )
                    return {
                        "strategy": strategy,
                        "notes": notes,
                        "parent_taxon_name_ids": [
                            parent.taxon_name_id for parent in parent_taxa
                        ],
                        "uninomial": components.uninomial,
                        "canonical_name": calculated.calculate_canonical_name_string(
                            components
                        ),
                        "scientific_name": strict_overlay_scientific_name,
                        "formatted_scientific_name": (
                            strict_overlay_formatted_scientific_name
                        ),
                    }

    if rank_name in HIGHER_RANK_INFRAGENERIC_NAMES and len(parent_taxa) == 1:
        stored_bracketed_component = extract_stored_bracketed_scientific_component(
            taxon_name
        )
        normalized_stored_bracketed_component = (
            normalize_higher_rank_infrageneric_component(
                stored_bracketed_component,
                rank_abbreviation=components.rank_abbreviation,
            )
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
                "parent_taxon_name_ids": [
                    parent.taxon_name_id for parent in parent_taxa
                ],
                "uninomial": components.uninomial,
                "canonical_name": best_parent_name_value(
                    parent_taxa[0], italicize=False
                ),
                "scientific_name": higher_rank_infrageneric,
                "formatted_scientific_name": higher_rank_infrageneric_formatted,
            }

    if strict and rank_name not in {SPECIES_RANK_NAME, *INFRASPECIFIC_RANK_NAMES}:
        components.rank_abbreviation = None

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

    if strict and rank_name not in {SPECIES_RANK_NAME, *INFRASPECIFIC_RANK_NAMES}:
        derived_canonical_name = calculated.calculate_canonical_name_string(
            components,
            include_rank=False,
        )
    if strict:
        notes.append(
            "Strict parallel mode is derived from parent links, parallel fields, and author only."
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
            if not row.deleted
            and row.parent_taxon_name
            and not row.parent_taxon_name.deleted
        ],
        key=lambda row: (row.sequence, row.parent_taxon_name_id),
    )
    return [row.parent_taxon_name for row in parent_rows]


def normalize_parallel_name_part(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = re.sub(r"\s+", " ", value).strip()
    return normalized or None


def derive_overlay_uninomial_from_infrageneric_parent(parent: TaxonName) -> str | None:
    candidate_values = [
        normalize_parallel_name_part(parent.canonical_name),
        normalize_parallel_name_part(parent.scientific_name),
    ]
    for value in candidate_values:
        if not value:
            continue
        stripped_value = calculated.strip_hybrid_formula_prefix(value) or value
        first_token = stripped_value.split(" ", 1)[0].strip("()")
        if first_token:
            return first_token
    return None


def stale_infraspecific_named_hybrid_override(
    *,
    taxon_name: TaxonName,
    components: schema.NameStringComponents,
    rank_name: str,
) -> bool:
    if rank_name not in INFRASPECIFIC_RANK_NAMES:
        return False
    if bool(getattr(taxon_name, "is_hybrid", False)):
        return False

    original_specific = normalize_parallel_name_part(taxon_name.specific_epithet)
    override_specific = normalize_parallel_name_part(
        taxon_name.parallel_override_specific_epithet
    )
    infraspecific_epithet = normalize_parallel_name_part(
        taxon_name.infraspecific_epithet
    )
    if not original_specific or not override_specific or not infraspecific_epithet:
        return False

    normalized_infraspecific_without_prefix = calculated.strip_hybrid_formula_prefix(
        infraspecific_epithet
    )
    if not normalized_infraspecific_without_prefix:
        return False

    return (
        override_specific == normalized_infraspecific_without_prefix
        and override_specific != original_specific
        and bool(re.match(r"^(x|X|×)\s+", infraspecific_epithet))
    )


def infraspecific_hybrid_like_current_fields_should_be_ignored(
    *,
    taxon_name: TaxonName,
    components: schema.NameStringComponents,
    rank_name: str,
    has_meaningful_specific_epithet_override: bool,
    has_meaningful_infraspecific_epithet_override: bool,
) -> bool:
    if rank_name not in INFRASPECIFIC_RANK_NAMES:
        return False
    if bool(getattr(taxon_name, "is_hybrid", False)):
        return False
    if (
        has_meaningful_specific_epithet_override
        or has_meaningful_infraspecific_epithet_override
    ):
        return False

    infraspecific_epithet = normalize_parallel_name_part(
        components.infraspecific_epithet
    )
    if not infraspecific_epithet:
        return False
    if not re.match(r"^(x|X|×)\s+", infraspecific_epithet):
        return False

    return True


def infer_parallel_infraspecific_epithet_from_specific_override(
    *,
    taxon_name: TaxonName,
) -> str | None:
    override_specific = normalize_parallel_name_part(
        taxon_name.parallel_override_specific_epithet
    )
    if not override_specific:
        return None

    current_infraspecific = normalize_parallel_name_part(
        taxon_name.infraspecific_epithet
    )
    if not current_infraspecific:
        return None

    stripped_current_infraspecific = calculated.strip_hybrid_formula_prefix(
        current_infraspecific
    )
    if (
        stripped_current_infraspecific
        and override_specific == stripped_current_infraspecific
        and bool(re.match(r"^(x|X|×)\s+", current_infraspecific))
    ):
        return override_specific

    return None


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
        best_parent_name_value(parent, italicize=False) for parent in parent_taxa
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
    stripped_value = normalized_value[len(prefix) :].strip()
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
    main_name = (
        f"{parent_value} ({bracketed_component})"
        if bracketed_component
        else parent_value
    )
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
        calculated.italicize_name(parent.uninomial) if italicize else parent.uninomial
    )
    if not genus_value or not infrageneric_value:
        return None

    # Keep strict overlay aligned with legacy display style for species/infraspecific
    # names by using a plain bracketed infrageneric component (no rank abbreviation).
    bracketed_component = infrageneric_value
    head = (
        f"{genus_value} ({bracketed_component})" if bracketed_component else genus_value
    )

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
            stripped_component = normalized_component[len(prefix) :].strip()
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
    stripped_hybrid_component = calculated.strip_hybrid_formula_prefix(
        normalized_component
    )
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
    infraspecific_epithet = normalize_parallel_name_part(
        components.infraspecific_epithet
    )
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
        calculated.italicize_name(specific_epithet) if italicize else specific_epithet
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
                derived_uninomial_display + updated_name[len(current_display) :]
            )
            break

    replacements = [
        (
            taxon_name.uninomial,
            (
                calculated.italicize_name(components.uninomial)
                if italicize
                else components.uninomial
            ),
        ),
        (
            taxon_name.specific_epithet,
            (
                calculated.italicize_name(components.specific_epithet)
                if italicize
                else components.specific_epithet
            ),
        ),
        (
            taxon_name.infraspecific_epithet,
            (
                calculated.italicize_name(components.infraspecific_epithet)
                if italicize
                else components.infraspecific_epithet
            ),
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
        infrageneric_names = TaxonNameCrud.generate_infrageneric_names(
            db, taxon_name_id
        )
    except HTTPException:
        return None

    for entry in infrageneric_names:
        if entry.name_version == INFRAGENUS_WITH_RANK:
            return {
                "scientific_name": (
                    entry.formatted_name_with_author or entry.formatted_name
                ),
                "formatted_scientific_name": entry.italicized_name,
            }
    return None
