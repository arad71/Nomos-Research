from types import SimpleNamespace

from app.db.taxon_name.parallel_name_preview import (
    derive_parallel_name,
    join_parent_names,
)


def test_derive_parallel_name_appends_ms_suffix_for_manuscript_names():
    taxon_name = SimpleNamespace(
        taxon_name_id=1,
        author="D.L.Jones & M.A.Clem.",
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Genus", rank_abbrev=None),
        rank_name="Genus",
        publication_status="manuscript_name",
        is_hybrid=False,
        hybrid_category=None,
        taxon_name_parents=[],
        parallel_override_uninomial="Cyanthera",
        parallel_override_specific_epithet=None,
        parallel_override_infraspecific_epithet=None,
        uninomial="Cyanthera",
        specific_epithet=None,
        infraspecific_epithet=None,
        canonical_name="Cyanthera ms",
        scientific_name="Cyanthera D.L.Jones & M.A.Clem. ms",
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["uninomial"] == "Cyanthera"
    assert derived["canonical_name"] == "Cyanthera ms"
    assert derived["scientific_name"] == "Cyanthera D.L.Jones & M.A.Clem. ms"
    assert (
        derived["formatted_scientific_name"]
        == "<i>Cyanthera</i> D.L.Jones & M.A.Clem. ms"
    )


def test_derive_parallel_name_marks_genus_level_named_hybrid():
    taxon_name = SimpleNamespace(
        taxon_name_id=1,
        author="D.L.Jones & M.A.Clem.",
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Genus", rank_abbrev=None),
        rank_name="Genus",
        is_hybrid=True,
        hybrid_category=SimpleNamespace(value="named_hybrid"),
        taxon_name_parents=[],
        parallel_override_uninomial="Cyanthera",
        parallel_override_specific_epithet=None,
        parallel_override_infraspecific_epithet=None,
        uninomial="Cyanthera",
        specific_epithet=None,
        infraspecific_epithet=None,
        canonical_name="Cyanthera",
        scientific_name="Cyanthera D.L.Jones & M.A.Clem.",
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["uninomial"] == "Cyanthera"
    assert derived["canonical_name"] == "× Cyanthera"
    assert derived["scientific_name"] == "× Cyanthera D.L.Jones & M.A.Clem."
    assert (
        derived["formatted_scientific_name"]
        == "× <i>Cyanthera</i> D.L.Jones & M.A.Clem."
    )


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


def test_join_parent_names_brackets_hybrid_formula_parent():
    taxon_name = SimpleNamespace(
        hybrid_category=SimpleNamespace(value="hybrid_formula")
    )
    parent_taxa = [
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Agrilus",
            canonical_name=None,
            scientific_name="Agrilus Curtis, 1825",
            formatted_scientific_name="<i>Agrilus</i> Curtis, 1825",
            uninomial="Agrilus",
            is_hybrid=False,
            hybrid_category=None,
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank=(
                "Acacia ampliceps x sclerosperma subsp. sclerosperma"
            ),
            canonical_name=None,
            scientific_name=("Acacia ampliceps x sclerosperma subsp. sclerosperma"),
            formatted_scientific_name=(
                "<i>Acacia ampliceps x sclerosperma</i> subsp. " "<i>sclerosperma</i>"
            ),
            uninomial="Acacia",
            is_hybrid=True,
            hybrid_category=SimpleNamespace(value="hybrid_formula"),
        ),
    ]

    assert join_parent_names(taxon_name, parent_taxa) == (
        "Agrilus × (Acacia ampliceps x sclerosperma subsp. sclerosperma)"
    )
    assert join_parent_names(taxon_name, parent_taxa, name_value="scientific") == (
        "Agrilus Curtis, 1825 × "
        "(Acacia ampliceps x sclerosperma subsp. sclerosperma)"
    )
    assert join_parent_names(
        taxon_name, parent_taxa, name_value="formatted_scientific"
    ) == (
        "<i>Agrilus</i> Curtis, 1825 × "
        "(<i>Acacia ampliceps x sclerosperma</i> subsp. "
        "<i>sclerosperma</i>)"
    )


def test_join_parent_names_does_not_bracket_named_hybrid_parent():
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
            is_hybrid=False,
            hybrid_category=None,
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia × xanthina",
            canonical_name=None,
            scientific_name="Acacia × xanthina A.R.Bean",
            formatted_scientific_name="<i>Acacia</i> ×<i>xanthina</i> A.R.Bean",
            uninomial=None,
            specific_epithet="xanthina",
            is_hybrid=True,
            hybrid_category=SimpleNamespace(value="named_hybrid"),
        ),
    ]

    assert join_parent_names(taxon_name, parent_taxa) == (
        "Acacia rhodophloia × Acacia × xanthina"
    )
    assert join_parent_names(taxon_name, parent_taxa, name_value="scientific") == (
        "Acacia rhodophloia Maslin × Acacia × xanthina A.R.Bean"
    )


def test_join_parent_names_unitalicizes_rank_in_stored_hybrid_parent():
    taxon_name = SimpleNamespace(
        hybrid_category=SimpleNamespace(value="hybrid_formula")
    )
    parent_taxa = [
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Agrilus",
            canonical_name=None,
            scientific_name="Agrilus Curtis, 1825",
            formatted_scientific_name="<i>Agrilus</i> Curtis, 1825",
            uninomial="Agrilus",
            is_hybrid=False,
            hybrid_category=None,
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank=(
                "Acacia ampliceps x sclerosperma subsp. sclerosperma"
            ),
            canonical_name=None,
            scientific_name=("Acacia ampliceps x sclerosperma subsp. sclerosperma"),
            formatted_scientific_name=(
                "<i>Acacia ampliceps x sclerosperma subsp. sclerosperma</i>"
            ),
            uninomial=None,
            specific_epithet=None,
            is_hybrid=True,
            hybrid_category=SimpleNamespace(value="hybrid_formula"),
        ),
    ]

    assert join_parent_names(
        taxon_name, parent_taxa, name_value="formatted_scientific"
    ) == (
        "<i>Agrilus</i> Curtis, 1825 × "
        "(<i>Acacia ampliceps x sclerosperma</i> subsp. "
        "<i>sclerosperma</i>)"
    )


def test_join_parent_names_brackets_hybrid_parent_for_intergrade():
    taxon_name = SimpleNamespace(hybrid_category=SimpleNamespace(value="intergrade"))
    parent_taxa = [
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia rhodophloia",
            canonical_name=None,
            scientific_name="Acacia rhodophloia Maslin",
            formatted_scientific_name="<i>Acacia rhodophloia</i> Maslin",
            uninomial="Acacia",
            is_hybrid=False,
            hybrid_category=None,
        ),
        SimpleNamespace(
            infragenus_name=None,
            canonical_name_without_rank="Acacia ampliceps x sclerosperma",
            canonical_name=None,
            scientific_name="Acacia ampliceps x sclerosperma",
            formatted_scientific_name="<i>Acacia ampliceps x sclerosperma</i>",
            uninomial="Acacia",
            is_hybrid=True,
            hybrid_category=SimpleNamespace(value="hybrid_formula"),
        ),
    ]

    assert join_parent_names(taxon_name, parent_taxa) == (
        "Acacia rhodophloia - (Acacia ampliceps x sclerosperma)"
    )
