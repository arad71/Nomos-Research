from types import SimpleNamespace

from app.db.taxon_name.parallel_name_preview import join_parent_names


def test_join_parent_names_keeps_repeated_genus_for_hybrid_formula():
    taxon_name = SimpleNamespace(
        hybrid_category=SimpleNamespace(value="hybrid_formula")
    )
    parent_taxa = [
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia rhodophloia",
            canonical_name=None,
            uninomial="Acacia",
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia sibirica",
            canonical_name=None,
            uninomial="Acacia",
        ),
    ]

    assert join_parent_names(taxon_name, parent_taxa) == (
        "Acacia rhodophloia × Acacia sibirica"
    )


def test_join_parent_names_keeps_repeated_genus_for_intergrade():
    taxon_name = SimpleNamespace(hybrid_category=SimpleNamespace(value="intergrade"))
    parent_taxa = [
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia rhodophloia",
            canonical_name=None,
            uninomial="Acacia",
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia sibirica",
            canonical_name=None,
            uninomial="Acacia",
        ),
    ]

    assert join_parent_names(taxon_name, parent_taxa) == (
        "Acacia rhodophloia - Acacia sibirica"
    )
