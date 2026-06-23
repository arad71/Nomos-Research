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


def test_derive_species_named_hybrid_uses_first_parent_with_specific_override():
    parent = SimpleNamespace(
        taxon_name_id=10,
        deleted=False,
        rank_name="Species",
        taxon_rank=SimpleNamespace(rank_name="Species"),
        uninomial="Acacia",
        canonical_name_without_rank="Acacia ampliceps",
        canonical_name="Acacia ampliceps",
        scientific_name="Acacia ampliceps Maslin",
        formatted_scientific_name="<i>Acacia ampliceps</i> Maslin",
        hybrid_category=None,
    )
    second_parent = SimpleNamespace(
        taxon_name_id=11,
        deleted=False,
        rank_name="Species",
        taxon_rank=SimpleNamespace(rank_name="Species"),
        uninomial="Acacia",
        canonical_name_without_rank="Acacia sclerosperma",
        canonical_name="Acacia sclerosperma",
        scientific_name="Acacia sclerosperma F.Muell.",
        formatted_scientific_name="<i>Acacia sclerosperma</i> F.Muell.",
        hybrid_category=None,
    )
    taxon_name = SimpleNamespace(
        taxon_name_id=1,
        author=None,
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Species", rank_abbrev=None),
        rank_name="Species",
        is_hybrid=True,
        hybrid_category=SimpleNamespace(value="named_hybrid"),
        taxon_name_parents=[
            SimpleNamespace(
                deleted=False,
                sequence=1,
                parent_taxon_name_id=parent.taxon_name_id,
                parent_taxon_name=parent,
            ),
            SimpleNamespace(
                deleted=False,
                sequence=2,
                parent_taxon_name_id=second_parent.taxon_name_id,
                parent_taxon_name=second_parent,
            ),
        ],
        parallel_override_uninomial=None,
        parallel_override_specific_epithet="danny",
        parallel_override_infraspecific_epithet=None,
        uninomial=None,
        specific_epithet="ampliceps x sclerosperma subsp. sclerosperma",
        infraspecific_epithet=None,
        canonical_name=None,
        scientific_name=None,
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["strategy"] == "named_hybrid_parent_genus_inheritance"
    assert derived["canonical_name"] == "× Acacia danny"


def test_derive_species_named_hybrid_parent_fallback_ignores_legacy_specific():
    parent = SimpleNamespace(
        taxon_name_id=10,
        deleted=False,
        rank_name="Species",
        taxon_rank=SimpleNamespace(rank_name="Species"),
        uninomial="Acacia",
        canonical_name_without_rank="Acacia ampliceps",
        canonical_name="Acacia ampliceps",
        scientific_name="Acacia ampliceps Maslin",
        formatted_scientific_name="<i>Acacia ampliceps</i> Maslin",
        hybrid_category=None,
    )
    taxon_name = SimpleNamespace(
        taxon_name_id=1,
        author=None,
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Species", rank_abbrev=None),
        rank_name="Species",
        is_hybrid=True,
        hybrid_category=SimpleNamespace(value="named_hybrid"),
        taxon_name_parents=[
            SimpleNamespace(
                deleted=False,
                sequence=1,
                parent_taxon_name_id=parent.taxon_name_id,
                parent_taxon_name=parent,
            ),
            SimpleNamespace(
                deleted=False,
                sequence=2,
                parent_taxon_name_id=11,
                parent_taxon_name=parent,
            ),
        ],
        parallel_override_uninomial=None,
        parallel_override_specific_epithet=None,
        parallel_override_infraspecific_epithet=None,
        uninomial="Acacia",
        specific_epithet="ampliceps x sclerosperma subsp. sclerosperma",
        infraspecific_epithet=None,
        canonical_name=None,
        scientific_name=None,
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["strategy"] == "named_hybrid_parent_genus_inheritance"
    assert derived["canonical_name"] == "× Acacia"


def test_derive_species_named_hybrid_skips_parent_when_override_is_present():
    parent = SimpleNamespace(
        taxon_name_id=10,
        deleted=False,
        rank_name="Species",
        taxon_rank=SimpleNamespace(rank_name="Species"),
        uninomial="Acacia",
        canonical_name_without_rank="Acacia ampliceps",
        canonical_name="Acacia ampliceps",
        scientific_name="Acacia ampliceps Maslin",
        formatted_scientific_name="<i>Acacia ampliceps</i> Maslin",
        hybrid_category=None,
    )
    taxon_name = SimpleNamespace(
        taxon_name_id=1,
        author=None,
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Species", rank_abbrev=None),
        rank_name="Species",
        is_hybrid=True,
        hybrid_category=SimpleNamespace(value="named_hybrid"),
        taxon_name_parents=[
            SimpleNamespace(
                deleted=False,
                sequence=1,
                parent_taxon_name_id=parent.taxon_name_id,
                parent_taxon_name=parent,
            ),
            SimpleNamespace(
                deleted=False,
                sequence=2,
                parent_taxon_name_id=11,
                parent_taxon_name=parent,
            ),
        ],
        parallel_override_uninomial="danny",
        parallel_override_specific_epithet="danny",
        parallel_override_infraspecific_epithet=None,
        uninomial="Acacia",
        specific_epithet="old",
        infraspecific_epithet=None,
        canonical_name=None,
        scientific_name=None,
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["strategy"] == "named_hybrid_parallel_override"
    assert derived["canonical_name"] == "× danny danny"


def test_derive_parallel_name_uses_bracketed_subgenus_for_canonical_name():
    parent = SimpleNamespace(
        taxon_name_id=1,
        rank_name="Genus",
        taxon_rank=SimpleNamespace(rank_name="Genus", rank_abbrev=None),
        infragenus_name=None,
        canonical_name_without_rank="Hypocaccus",
        canonical_name="Hypocaccus",
        scientific_name="Hypocaccus Thomson, 1867",
        formatted_scientific_name="<i>Hypocaccus</i> Thomson, 1867",
        uninomial="Hypocaccus",
        deleted=False,
    )
    taxon_name = SimpleNamespace(
        taxon_name_id=2,
        author="Reichardt, 1926",
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Subgenus", rank_abbrev="subg."),
        rank_name="Subgenus",
        publication_status="published",
        is_hybrid=False,
        hybrid_category=None,
        taxon_name_parents=[
            SimpleNamespace(
                parent_taxon_name=parent,
                parent_taxon_name_id=parent.taxon_name_id,
                sequence=1,
                deleted=False,
            )
        ],
        parallel_override_uninomial="Baeckmanniolus",
        parallel_override_specific_epithet=None,
        parallel_override_infraspecific_epithet=None,
        uninomial="Baeckmanniolus",
        specific_epithet=None,
        infraspecific_epithet=None,
        canonical_name="Hypocaccus",
        scientific_name="Hypocaccus (Baeckmanniolus) Reichardt, 1926",
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["canonical_name"] == "Hypocaccus (Baeckmanniolus)"
    assert derived["scientific_name"] == ("Hypocaccus (Baeckmanniolus) Reichardt, 1926")


def test_derive_infraspecific_name_carries_parent_bracketed_subgenus():
    parent = SimpleNamespace(
        taxon_name_id=274827,
        deleted=False,
        rank_name="Species",
        taxon_rank=SimpleNamespace(rank_name="Species", rank_abbrev=None),
        infragenus_name=None,
        canonical_name_without_rank="Cicindela mastersi",
        canonical_name="Cicindela mastersi",
        scientific_name="Cicindela (Myriochile) mastersi Castelnau, 1867",
        formatted_scientific_name=(
            "<i>Cicindela</i> (<i>Myriochile</i>) <i>mastersi</i> " "Castelnau, 1867"
        ),
        uninomial="Cicindela",
        specific_epithet="mastersi",
        hybrid_category=None,
    )
    taxon_name = SimpleNamespace(
        taxon_name_id=274828,
        author="Horn, 1901",
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Subspecies", rank_abbrev=None),
        rank_name="Subspecies",
        publication_status="published",
        is_hybrid=False,
        hybrid_category=None,
        taxon_name_parents=[
            SimpleNamespace(
                parent_taxon_name=parent,
                parent_taxon_name_id=parent.taxon_name_id,
                sequence=1,
                deleted=False,
            )
        ],
        parallel_override_uninomial="Cicindela",
        parallel_override_specific_epithet="mastersi",
        parallel_override_infraspecific_epithet="catoptriola",
        uninomial="Cicindela",
        specific_epithet="mastersi",
        infraspecific_epithet="catoptriola",
        canonical_name="Cicindela mastersi catoptriola",
        scientific_name="Cicindela mastersi catoptriola Horn, 1901",
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["strategy"] == "strict_parent_bracketed_scientific_overlay"
    assert derived["canonical_name"] == "Cicindela (Myriochile) mastersi catoptriola"
    assert derived["scientific_name"] == (
        "Cicindela (Myriochile) mastersi catoptriola Horn, 1901"
    )
    assert derived["formatted_scientific_name"] == (
        "<i>Cicindela</i> (<i>Myriochile</i>) <i>mastersi</i> "
        "<i>catoptriola</i> Horn, 1901"
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


def test_derive_hybrid_formula_uses_parallel_override_instead_of_parent_formula():
    parents = [
        SimpleNamespace(
            taxon_name_id=10,
            deleted=False,
            infragenus_name=None,
            rank_name="Species",
            taxon_rank=SimpleNamespace(rank_name="Species"),
            canonical_name_without_rank="Acacia ampliceps",
            canonical_name="Acacia ampliceps",
            scientific_name="Acacia ampliceps Maslin",
            formatted_scientific_name="<i>Acacia ampliceps</i> Maslin",
            uninomial="Acacia",
            specific_epithet="ampliceps",
            infraspecific_epithet=None,
            is_hybrid=False,
            hybrid_category=None,
        ),
        SimpleNamespace(
            taxon_name_id=11,
            deleted=False,
            infragenus_name=None,
            rank_name="Subspecies",
            taxon_rank=SimpleNamespace(rank_name="Subspecies"),
            canonical_name_without_rank="Acacia sclerosperma subsp. sclerosperma",
            canonical_name="Acacia sclerosperma subsp. sclerosperma",
            scientific_name="Acacia sclerosperma F.Muell. subsp. sclerosperma",
            formatted_scientific_name=(
                "<i>Acacia sclerosperma</i> F.Muell. subsp. " "<i>sclerosperma</i>"
            ),
            uninomial="Acacia",
            specific_epithet="sclerosperma",
            rank_abbreviation="subsp.",
            infraspecific_epithet="sclerosperma",
            is_hybrid=False,
            hybrid_category=None,
        ),
    ]
    taxon_name = SimpleNamespace(
        taxon_name_id=12,
        author=None,
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Species", rank_abbrev=None),
        rank_name="Species",
        publication_status="published",
        is_hybrid=True,
        hybrid_category=SimpleNamespace(value="hybrid_formula"),
        taxon_name_parents=[
            SimpleNamespace(
                parent_taxon_name=parents[0],
                parent_taxon_name_id=parents[0].taxon_name_id,
                sequence=1,
                deleted=False,
            ),
            SimpleNamespace(
                parent_taxon_name=parents[1],
                parent_taxon_name_id=parents[1].taxon_name_id,
                sequence=2,
                deleted=False,
            ),
        ],
        parallel_override_uninomial="danny",
        parallel_override_specific_epithet="x bob",
        parallel_override_infraspecific_epithet=None,
        uninomial=None,
        specific_epithet=None,
        infraspecific_epithet=None,
        canonical_name="Acacia ampliceps × Acacia sclerosperma subsp. sclerosperma",
        scientific_name=(
            "Acacia ampliceps Maslin × "
            "Acacia sclerosperma F.Muell. subsp. sclerosperma"
        ),
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["strategy"] == "hybrid_parallel_override"
    assert derived["canonical_name"] == "danny x bob"
    assert derived["scientific_name"] == "danny x bob"
    assert derived["formatted_scientific_name"] == "<i>danny</i> <i>x bob</i>"


def test_derive_hybrid_formula_uses_parent_formula_without_uninomial_override():
    parents = [
        SimpleNamespace(
            taxon_name_id=10,
            deleted=False,
            infragenus_name=None,
            rank_name="Species",
            taxon_rank=SimpleNamespace(rank_name="Species"),
            canonical_name_without_rank="Acacia ampliceps",
            canonical_name="Acacia ampliceps",
            scientific_name="Acacia ampliceps Maslin",
            formatted_scientific_name="<i>Acacia ampliceps</i> Maslin",
            uninomial="Acacia",
            specific_epithet="ampliceps",
            infraspecific_epithet=None,
            is_hybrid=False,
            hybrid_category=None,
        ),
        SimpleNamespace(
            taxon_name_id=11,
            deleted=False,
            infragenus_name=None,
            rank_name="Subspecies",
            taxon_rank=SimpleNamespace(rank_name="Subspecies"),
            canonical_name_without_rank="Acacia sclerosperma subsp. sclerosperma",
            canonical_name="Acacia sclerosperma subsp. sclerosperma",
            scientific_name="Acacia sclerosperma F.Muell. subsp. sclerosperma",
            formatted_scientific_name=(
                "<i>Acacia sclerosperma</i> F.Muell. subsp. " "<i>sclerosperma</i>"
            ),
            uninomial="Acacia",
            specific_epithet="sclerosperma",
            rank_abbreviation="subsp.",
            infraspecific_epithet="sclerosperma",
            is_hybrid=False,
            hybrid_category=None,
        ),
    ]
    taxon_name = SimpleNamespace(
        taxon_name_id=12,
        author=None,
        is_autonym=False,
        taxon_rank=SimpleNamespace(rank_name="Species", rank_abbrev=None),
        rank_name="Species",
        publication_status="published",
        is_hybrid=True,
        hybrid_category=SimpleNamespace(value="hybrid_formula"),
        taxon_name_parents=[
            SimpleNamespace(
                parent_taxon_name=parents[0],
                parent_taxon_name_id=parents[0].taxon_name_id,
                sequence=1,
                deleted=False,
            ),
            SimpleNamespace(
                parent_taxon_name=parents[1],
                parent_taxon_name_id=parents[1].taxon_name_id,
                sequence=2,
                deleted=False,
            ),
        ],
        parallel_override_uninomial=None,
        parallel_override_specific_epithet="x bob",
        parallel_override_infraspecific_epithet=None,
        uninomial=None,
        specific_epithet=None,
        infraspecific_epithet=None,
        canonical_name="Acacia ampliceps × Acacia sclerosperma subsp. sclerosperma",
        scientific_name=(
            "Acacia ampliceps Maslin × "
            "Acacia sclerosperma F.Muell. subsp. sclerosperma"
        ),
    )

    derived = derive_parallel_name(None, taxon_name, strict=True)

    assert derived["strategy"] == "hybrid_parent_formula"
    assert derived["canonical_name"] == (
        "Acacia ampliceps × Acacia sclerosperma subsp. sclerosperma"
    )
    assert derived["scientific_name"] == (
        "Acacia ampliceps Maslin × " "Acacia sclerosperma F.Muell. subsp. sclerosperma"
    )


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


def test_join_parent_names_rebuilds_nested_hybrid_formula_parent_for_scientific_names():
    taxon_name = SimpleNamespace(
        hybrid_category=SimpleNamespace(value="hybrid_formula")
    )
    nested_parent_one = SimpleNamespace(
        taxon_name_id=2147,
        deleted=False,
        infragenus_name=None,
        canonical_name_without_rank="Acacia ampliceps",
        canonical_name="Acacia ampliceps",
        scientific_name="Acacia ampliceps Maslin",
        formatted_scientific_name="<i>Acacia</i> <i>ampliceps</i> Maslin",
        uninomial="Acacia",
        specific_epithet="ampliceps",
        infraspecific_epithet=None,
        author="Maslin",
        is_autonym=False,
        is_hybrid=False,
        hybrid_category=None,
    )
    nested_parent_two = SimpleNamespace(
        taxon_name_id=7458,
        deleted=False,
        infragenus_name=None,
        canonical_name_without_rank="Acacia sclerosperma subsp. sclerosperma",
        canonical_name="Acacia sclerosperma subsp. sclerosperma",
        scientific_name="Acacia sclerosperma F.Muell. subsp. sclerosperma",
        formatted_scientific_name=(
            "<i>Acacia</i> <i>sclerosperma</i> F.Muell. subsp. " "<i>sclerosperma</i>"
        ),
        uninomial="Acacia",
        specific_epithet="sclerosperma",
        rank_abbreviation="subsp.",
        infraspecific_epithet="sclerosperma",
        author="F.Muell.",
        is_autonym=False,
        is_hybrid=False,
        hybrid_category=None,
    )
    hybrid_parent = SimpleNamespace(
        taxon_name_id=31299,
        deleted=False,
        infragenus_name=None,
        canonical_name_without_rank=(
            "Acacia ampliceps × sclerosperma subsp. sclerosperma"
        ),
        canonical_name="Acacia ampliceps × sclerosperma subsp. sclerosperma",
        scientific_name="Acacia ampliceps × sclerosperma subsp. sclerosperma",
        formatted_scientific_name=(
            "<i>Acacia ampliceps × sclerosperma subsp. sclerosperma</i>"
        ),
        uninomial="Acacia",
        is_hybrid=True,
        hybrid_category=SimpleNamespace(value="hybrid_formula"),
        taxon_name_parents=[
            SimpleNamespace(
                parent_taxon_name=nested_parent_one,
                parent_taxon_name_id=nested_parent_one.taxon_name_id,
                sequence=1,
                deleted=False,
            ),
            SimpleNamespace(
                parent_taxon_name=nested_parent_two,
                parent_taxon_name_id=nested_parent_two.taxon_name_id,
                sequence=2,
                deleted=False,
            ),
        ],
    )
    parent_taxa = [
        SimpleNamespace(
            taxon_name_id=347,
            deleted=False,
            infragenus_name=None,
            canonical_name_without_rank="Acacia eriopoda",
            canonical_name="Acacia eriopoda",
            scientific_name="Acacia eriopoda Maiden & Blakely",
            formatted_scientific_name="<i>Acacia</i> <i>eriopoda</i> Maiden & Blakely",
            uninomial="Acacia",
            specific_epithet="eriopoda",
            infraspecific_epithet=None,
            author="Maiden & Blakely",
            is_hybrid=False,
            hybrid_category=None,
        ),
        hybrid_parent,
    ]

    assert join_parent_names(taxon_name, parent_taxa, name_value="scientific") == (
        "Acacia eriopoda Maiden & Blakely × "
        "(Acacia ampliceps Maslin × "
        "Acacia sclerosperma F.Muell. subsp. sclerosperma)"
    )
    assert join_parent_names(
        taxon_name, parent_taxa, name_value="formatted_scientific"
    ) == (
        "<i>Acacia</i> <i>eriopoda</i> Maiden & Blakely × "
        "(<i>Acacia</i> <i>ampliceps</i> Maslin × "
        "<i>Acacia</i> <i>sclerosperma</i> F.Muell. subsp. "
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
