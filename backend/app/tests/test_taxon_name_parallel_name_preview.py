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
            scientific_name="Acacia rhodophloia Maslin",
            formatted_scientific_name="<i>Acacia rhodophloia</i> Maslin",
            uninomial="Acacia",
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia sibirica",
            canonical_name=None,
            scientific_name="Acacia sibirica S.Moore",
            formatted_scientific_name="<i>Acacia sibirica</i> S.Moore",
            uninomial="Acacia",
        ),
    ]

    assert join_parent_names(taxon_name, parent_taxa) == (
        "Acacia rhodophloia × Acacia sibirica"
    )
    assert join_parent_names(taxon_name, parent_taxa, name_value="scientific") == (
        "Acacia rhodophloia Maslin × Acacia sibirica S.Moore"
    )
    assert join_parent_names(
        taxon_name, parent_taxa, name_value="formatted_scientific"
    ) == ("<i>Acacia rhodophloia</i> Maslin × " "<i>Acacia sibirica</i> S.Moore")


def test_join_parent_names_keeps_repeated_genus_for_intergrade():
    taxon_name = SimpleNamespace(hybrid_category=SimpleNamespace(value="intergrade"))
    parent_taxa = [
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia rhodophloia",
            canonical_name=None,
            scientific_name="Acacia rhodophloia Maslin",
            formatted_scientific_name="<i>Acacia rhodophloia</i> Maslin",
            uninomial="Acacia",
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia sibirica",
            canonical_name=None,
            scientific_name="Acacia sibirica S.Moore",
            formatted_scientific_name="<i>Acacia sibirica</i> S.Moore",
            uninomial="Acacia",
        ),
    ]

    assert join_parent_names(taxon_name, parent_taxa) == (
        "Acacia rhodophloia - Acacia sibirica"
    )
    assert join_parent_names(taxon_name, parent_taxa, name_value="scientific") == (
        "Acacia rhodophloia Maslin - Acacia sibirica S.Moore"
    )


def test_join_parent_names_keeps_infraspecific_rank_abbreviation_unitalicized():
    taxon_name = SimpleNamespace(
        hybrid_category=SimpleNamespace(value="hybrid_formula")
    )
    parent_taxa = [
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia rhodophloia",
            canonical_name=None,
            scientific_name="Acacia rhodophloia Maslin",
            formatted_scientific_name=None,
            uninomial="Acacia",
            specific_epithet="rhodophloia",
            infraspecific_epithet=None,
            author="Maslin",
            is_autonym=False,
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia sibirica subsp. valida",
            canonical_name=None,
            scientific_name="Acacia sibirica subsp. valida S.Moore",
            formatted_scientific_name=None,
            uninomial="Acacia",
            specific_epithet="sibirica",
            rank_abbreviation="subsp.",
            infraspecific_epithet="valida",
            author="S.Moore",
            is_autonym=False,
        ),
    ]

    assert join_parent_names(
        taxon_name, parent_taxa, name_value="formatted_scientific"
    ) == (
        "<i>Acacia</i> <i>rhodophloia</i> Maslin × "
        "<i>Acacia</i> <i>sibirica</i> subsp. <i>valida</i> S.Moore"
    )


def test_join_parent_names_normalizes_variety_rank_abbreviation():
    taxon_name = SimpleNamespace(
        hybrid_category=SimpleNamespace(value="hybrid_formula")
    )
    parent_taxa = [
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia rhodophloia",
            canonical_name=None,
            scientific_name="Acacia rhodophloia Maslin",
            formatted_scientific_name=None,
            uninomial="Acacia",
            specific_epithet="rhodophloia",
            infraspecific_epithet=None,
            author="Maslin",
            is_autonym=False,
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia sibirica var. valida",
            canonical_name=None,
            scientific_name="Acacia sibirica var. valida S.Moore",
            formatted_scientific_name=None,
            uninomial="Acacia",
            specific_epithet="sibirica",
            rank_abbreviation="var",
            infraspecific_epithet="valida",
            author="S.Moore",
            is_autonym=False,
        ),
    ]

    assert join_parent_names(
        taxon_name, parent_taxa, name_value="formatted_scientific"
    ) == (
        "<i>Acacia</i> <i>rhodophloia</i> Maslin × "
        "<i>Acacia</i> <i>sibirica</i> var. <i>valida</i> S.Moore"
    )
