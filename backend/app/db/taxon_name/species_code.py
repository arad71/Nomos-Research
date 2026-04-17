"""WACensus-parity Species Code generation.

Replicates legacy WACensus Max MDB species code logic exactly.

Rules:
  Genus              → No species code (None)
  Species            → GEN(3) + SPC(3)          e.g. Verticordia staminosa     → VERSTA
  Subspecies/Variety → GEN(3) + SPC(3) + INF(3) e.g. V. staminosa cylindracea  → VERSTACYL
  Quadrinomial       → Use trinomial form (same as subspecies)
  Phrase name        → GEN(3) + "SP."           e.g. Verticordia sp.           → VERSP.
  Nothotaxa          → GEN(3) + " X " + SPC(1)  e.g. Verticordia ×staminosa   → VER X S

Phase 1: No reinterpretation or optimisation of logic.
"""

from __future__ import annotations

from typing import Optional

from loguru import logger

# Ranks at species level and below that receive a species code.
SPECIES_LEVEL_RANKS = {
    "Species",
    "Subspecies",
    "Variety",
    "Form",
    "Subvariety",
    "Subform",
    "Nothovariety",
    "Cultivar",
}

# Ranks that include the infraspecific epithet in the code
INFRASPECIFIC_RANKS = {
    "Subspecies",
    "Variety",
    "Form",
    "Subvariety",
    "Subform",
    "Cultivar",
}

# Nothotaxa rank names (hybrid taxa)
NOTHOTAXA_RANKS = {
    "Nothovariety",
}


def _upper_prefix(value: Optional[str], length: int) -> str:
    """Extract the first `length` characters from a string, uppercased.

    Args:
        value: The source string.
        length: Number of characters to take.

    Returns:
        Uppercased prefix, or empty string if value is None/empty.
    """
    if not value:
        return ""
    cleaned = value.strip()
    return cleaned[:length].upper()


def _is_phrase_name(target) -> bool:
    """Detect whether this taxon is a phrase name.

    WACensus phrase names have a specific_epithet that starts with "sp."
    (case-insensitive), e.g. "sp. A Kimberley Flora".
    """
    if not target.specific_epithet:
        return False
    return target.specific_epithet.strip().lower().startswith("sp.")


def _is_nothotaxon(target) -> bool:
    """Detect whether this taxon is a nothotaxon (hybrid).

    Nothotaxa are identified by:
    - rank_name in NOTHOTAXA_RANKS, OR
    - specific_epithet starting with '×' or 'x ' (hybrid marker)
    """
    rank_name = target.taxon_rank.rank_name if target.taxon_rank else ""
    if rank_name in NOTHOTAXA_RANKS:
        return True
    if target.specific_epithet:
        se = target.specific_epithet.strip()
        if se.startswith("\u00d7") or se.lower().startswith("x "):
            return True
    return False


def _clean_epithet(epithet: Optional[str]) -> str:
    """Remove hybrid markers (× or x prefix) from an epithet for code generation."""
    if not epithet:
        return ""
    cleaned = epithet.strip()
    if cleaned.startswith("\u00d7"):
        cleaned = cleaned[1:].strip()
    elif cleaned.lower().startswith("x "):
        cleaned = cleaned[2:].strip()
    return cleaned


def generate_species_code(target) -> Optional[str]:
    """Generate a WACensus-parity species code for a TaxonName.

    This function is called from the SQLAlchemy before_update event and
    from create_item() after the taxon_name_id has been assigned.

    Args:
        target: A TaxonName model instance with taxon_rank relationship loaded.

    Returns:
        The species code string (uppercase), or None if the taxon is above
        species level or lacks required data.
    """
    # Guard: need a rank to determine level
    if not hasattr(target, "taxon_rank") or target.taxon_rank is None:
        return None

    rank_name = target.taxon_rank.rank_name

    # Genus and above: no species code
    if rank_name not in SPECIES_LEVEL_RANKS:
        return None

    # Must have a uninomial (genus) to generate any species code
    if not target.uninomial:
        return None

    gen = _upper_prefix(target.uninomial, 3)

    # Phrase names: GEN + "SP."
    if _is_phrase_name(target):
        return f"{gen}SP."

    # Nothotaxa: GEN + " X " + first char of specific epithet
    if _is_nothotaxon(target):
        spc_clean = _clean_epithet(target.specific_epithet)
        spc_initial = _upper_prefix(spc_clean, 1)
        return f"{gen} X {spc_initial}"

    # Must have a specific epithet for species and below
    if not target.specific_epithet:
        return None

    spc = _upper_prefix(target.specific_epithet, 3)

    # Infraspecific ranks (subspecies, variety, form, quadrinomial):
    # GEN(3) + SPC(3) + INF(3)
    if rank_name in INFRASPECIFIC_RANKS:
        inf = _upper_prefix(target.infraspecific_epithet, 3)
        if inf:
            return f"{gen}{spc}{inf}"
        # Fallback if no infraspecific epithet: use species-level code
        return f"{gen}{spc}"

    # Species: GEN(3) + SPC(3)
    return f"{gen}{spc}"


def should_generate_species_code(target) -> bool:
    """Check whether a species code should be generated for this taxon.

    Returns True for species-level and below, False for genus and above.
    """
    if not hasattr(target, "taxon_rank") or target.taxon_rank is None:
        return False
    return target.taxon_rank.rank_name in SPECIES_LEVEL_RANKS
