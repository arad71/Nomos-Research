# Strict Parallel Name Rules Matrix

## Purpose

This document describes the current agreed rules for the strict parallel name
engine in a shareable format.

It is intended for:

- herbarium review
- technical review
- rollout QA
- future implementation work to replace the legacy name engine

This is not a deployment runbook. It is the strict naming-logic reference.

## Design Intent

The strict parallel engine is intended to become the replacement for the current
name builder.

- parallel fields on `taxon_name`
- linked `taxon_name_parents`
- hierarchy context
- explicit strict formatting rules

The goal is to make the naming rules explicit, testable, and discussable.

## Core Inputs

The strict parallel engine currently works from a combination of:

- linked `taxon_name_parents` (ordered)
- parallel fields only:
  - `parallel_override_uninomial`
  - `parallel_override_specific_epithet`
  - `parallel_override_infraspecific_epithet`
- rank metadata (`rank_name`, `rank_abbrev`)
- author field
- hybrid semantics (`is_hybrid`, `hybrid_category`)

Strict derived output does not use legacy component fields as source-of-truth
inputs:

- `uninomial`
- `specific_epithet`
- `infraspecific_epithet`

Those remain legacy fields for current-name comparison and migration QA.

## How To Read This Matrix

The hard part is that similar-looking names often belong to different rule
families.

The main distinction is usually not kingdom alone. It is usually:

- rank pattern
- whether a parent link supplies genus context or infrageneric context
- whether a bracketed component is repeated, different, or higher-rank
- whether the name is hybrid, intergrade, or ordinary

Kingdom still matters in some places, especially:

- author formatting
- whether rank abbreviations are expected in the current name
- whether repeated lower-name forms are normal or exceptional

But many of the rules that have looked like “the same bug” are actually different
structure families that need separate strict rules.

## General Principles

### 1. Parallel fields are the parallel source of truth

If a parallel field is populated, the parallel engine should use it instead of
blindly inheriting that same part from a linked parent.

### 2. Parent links provide context, not always replacement

A linked parent does not always replace the child’s `uninomial`.

Examples:

- species under a genus parent: yes, parent can supply the genus context
- higher-rank infrageneric names: parent gives genus context, but the child’s
  parallel uninomial remains the infrageneric component

### 3. Hierarchy can provide parent context

For some ranks, especially higher-rank infrageneric names, hierarchy can provide
the direct parent link even when exact uninomial matching cannot.

### 4. This Matrix Documents Strict Output Only

This document describes the strict engine only.

It does not describe transitional non-strict fallback behavior.

## Rule Matrix

## Rank Assembly Reference (Strict Derived Output)

This section is the quick reference for how strict **derived** names are
assembled for each rank family.

### Genus and above (non-infrageneric higher ranks)

- Strategy family: `stored_fields` unless an explicit higher-rank infrageneric
  parent rule applies.
- Canonical assembly:
  - `parallel_override_uninomial` when set
  - otherwise empty/unchanged strict component behavior
- Scientific assembly:
  - canonical head + author
- Author placement:
  - scientific includes author at the end
  - canonical never includes author

### Species

- Strategy families:
  - `single_parent_species_inheritance`
  - `infrageneric_overlay`
  - `strict_infrageneric_parent_overlay`
  - `hybrid_parent_formula` (when 2+ parents)
- Canonical assembly:
  - uninomial from linked genus parent unless explicit parallel uninomial
    override is present
  - specific epithet from `parallel_override_specific_epithet` when present;
    otherwise from allowed parent inheritance path
- Scientific assembly:
  - canonical + author
  - for infrageneric overlay: `Genus (Infragenus) species + author`
- Author placement:
  - appended at end of scientific
  - excluded from canonical

### Infraspecific ranks

Ranks:
- subspecies
- variety
- subvariety
- form
- subform

- Strategy families:
  - `single_parent_infraspecific_inheritance`
  - `infrageneric_overlay`
  - `strict_infrageneric_parent_overlay`
  - `hybrid_parent_formula` (when 2+ parents)
- Canonical assembly:
  - uninomial from linked parent unless explicit parallel uninomial override
  - specific epithet from `parallel_override_specific_epithet` when present;
    otherwise inherited from linked species parent when available
  - rank abbreviation from taxon rank metadata
  - infraspecific epithet from:
    - `parallel_override_infraspecific_epithet` when present, else
    - `parallel_override_specific_epithet` fallback when set, else
    - inherited parent species epithet where the inheritance rule applies
- Scientific assembly:
  - canonical + author
- Author placement:
  - appended at end of scientific
  - excluded from canonical

### Higher-rank infrageneric names

Ranks:
- subgenus
- section
- subsection
- series
- subseries

- Strategy family: `higher_rank_infrageneric_parent_inheritance`
- Canonical assembly:
  - parent genus-level canonical value
- Scientific assembly:
  - `ParentGenus (rank-abbrev. parallel_uninomial) + author`
  - rank abbreviation is shown once
- Author placement:
  - appended at end of scientific
  - excluded from canonical

### Hybrid and intergrade formulas (multi-parent)

- Strategy family: `hybrid_parent_formula`
- Canonical assembly:
  - ordered parent values joined by separator
  - separators:
    - ` × ` by default
    - ` - ` for `intergrade`
- Scientific assembly:
  - canonical formula + author
- Author placement:
  - appended at end of scientific
  - excluded from canonical

### Genus And Above

Examples:

- genus
- family
- order

Rules:

- these names are treated primarily as stored names
- parent-link derivation is generally not required
- canonical name remains the current canonical value
- scientific name remains driven by the existing stored structure unless a future
  replacement rule is defined explicitly

Operational note:

- these ranks were excluded from the earlier parent-review workflow unless a
  specific higher-rank infrageneric case applies

Hybrid-formula note:

- if a stored name begins with a hybrid formula marker such as `X `, `x `, or `× `,
  the stored `uninomial` should be normalized back to the raw semantic value
  without the marker
- the leading `×` should then be rendered by the name builder from:
  - `is_hybrid = true`
  - `hybrid_category = hybrid_formula`
- this keeps the multiplication sign as derived output rather than baked into the
  stored name component text

### Species

Rules:

- if a single linked parent exists and that parent is a genus-style parent, the
  parallel engine may inherit genus/uninomial context from the parent
- if a linked parent points downward to a lower rank, such as a genus linked to a
  child species, the parallel engine should ignore that parent link as invalid
- if a linked genus-style parent conflicts with the stored genus/uninomial, the
  strict parallel engine should retain the stored genus context rather than forcing
  a conflicting parent replacement
- if the current scientific name already starts with a different genus/uninomial
  than the stored component field, strict mode should retain the current
  scientific-name genus/uninomial as the safer source of truth
- once strict mode has retained that current genus/uninomial, parent inheritance
  should not overwrite it again with a conflicting parent value
- if a single linked parent is an infrageneric parent such as `Subgenus`, the
  linked parent should be treated as bracketed scientific-name context rather than
  a genus replacement
- the child keeps its own species epithet unless a parallel specific-epithet
  field overrides it
- scientific name is built from:
  - inherited or parallel genus/uninomial
  - species epithet
  - author

Strict-mode note:

- for species with an infrageneric parent, strict mode should now build the
  bracketed scientific name directly from:
  - child genus/uninomial
  - parent infrageneric value and rank abbreviation
  - child species epithet
  - author
- if the linked infrageneric parent repeats the same uninomial as the genus, the
  strict parallel engine should not add a redundant `Genus (Genus)` overlay
- if no linked infrageneric parent exists but the stored scientific name already
  contains a bracketed infrageneric component, strict mode may rebuild the
  scientific name from that stored bracketed component without using the legacy
  infrageneric fallback
- the strict fallback that retains the current scientific-name genus/uninomial
  should only apply to species and infraspecific ranks
- that strict genus-retention rule must not be applied to higher-rank
  infrageneric records such as `Subgenus`, because there the child component is
  the infrageneric name rather than the genus

Pattern note:

- a species with an infrageneric overlay is not the same rule family as a
  higher-rank infrageneric name
- even if both contain bracketed parts, the species case still keeps its own
  genus and epithet structure

### Infraspecific Ranks

Examples:

- subspecies
- variety
- subvariety
- form
- subform

Rules:

- a single linked parent may supply species context
- if the child record intentionally has no stored species epithet, the parallel
  engine should not force one in from the parent
- if the current stored name omits a stored specific or infraspecific component,
  strict mode should omit that component rather than forcing it back in from the
  component fields
- if a rank below species has duplicated specific and infraspecific components but
  the current name is not written as a doubled trinomial, strict mode should
  suppress the repeated lower segment
- if the current name does include the repeated rank-and-epithet form, as in a
  normal autonym-style `subsp. x` or `var. x`, or an Animalia-style repeated
  trinomial like `Genus species species`, strict mode should preserve it
- the child keeps its own lower epithet unless the parallel infraspecific field
  overrides it
- scientific name is built from:
  - inherited or parallel uninomial
  - inherited or parallel specific epithet
  - rank abbreviation where applicable
  - infraspecific epithet
  - author

Strict-mode note:

- if the rank abbreviation is missing from the immediate components, the parallel
  engine should recover it from the taxon rank definition so values like `subsp.`,
  `var.`, and `forma` are preserved
- the same strict current-genus retention rule used for species may also apply
  here, but only to protect genus/species context and not to replace the child’s
  lower-rank component

Pattern note:

- these records split into at least two distinct forms:
  - rank-marked forms such as `subsp. x` and `var. x`
  - repeated trinomial forms such as `Genus species species`
- those forms may need different preservation rules even when they look similar

### Higher-Rank Infrageneric Names

Examples:

- subgenus
- section
- subsection
- series
- subseries

Rules:

- these names should use a linked parent or hierarchy parent for genus context
- the child’s parallel uninomial represents the infrageneric component
- the linked parent should not overwrite that infrageneric component
- strict mode should not replace the child infrageneric component with the genus
  pulled from the current scientific name
- if the parallel uninomial is just a stale copy of the genus but the current
  scientific name already contains a different bracketed infrageneric component,
  strict mode should use that stored bracketed component instead
- if the stored bracketed scientific-name component already contains the rank
  prefix, such as `subg. Dermocybe`, the engine should strip the rank prefix
  before rebuilding the scientific name so the final output does not duplicate it
- canonical name currently follows the Nomos convention of remaining at the
  genus-level value
- scientific name should be built as:
  - `ParentName (rank-abbrev. ParallelUninomial) Author`

Example:

- parent genus: `Collybia`
- rank: `Subgenus`
- parallel uninomial: `Leucocalocybe`
- result:
  - canonical: `Collybia`
  - scientific: `Collybia (subg. Leucocalocybe) ...`

Pattern note:

- these records are not “species with a bracketed part”
- the bracketed part is the child’s own infrageneric identity
- the parent supplies genus context only

### Species With Infrageneric Overlay

Examples:

- `Heteromysis (Olivemysis) abrucei`
- `Lophopagurus (Australeremus) triserratus`

Rules:

- the bracketed infrageneric component is not the genus replacement
- canonical name should stay at the genus + epithet level
- scientific name may include bracketed infrageneric context
- if a linked parent is a `Subgenus`, it should be treated as an infrageneric
  overlay input, not as the genus source
- if no linked infrageneric parent exists but the stored scientific name already
  carries a bracketed component, strict mode may rebuild directly from that
  stored bracketed component
- repeated bracketed forms such as `Genus (Genus) species` are valid strict
  outputs and must not be collapsed to `Genus species`

Example:

- canonical: `Lophopagurus triserratus`
- scientific: `Lophopagurus (Australeremus) triserratus`

Pattern note:

- this family contains at least two different subcases:
  - `Genus (DifferentInfragenus) species`
  - `Genus (Genus) species`
- both must keep the bracketed component in strict output

### Hybrid And Intergrade Names

Rules:

- multiple ordered parent rows are assembled in `sequence`
- separator depends on hybrid category
- a leading multiplication sign should be rendered from semantic hybrid state,
  not stored inside the raw `uninomial` component
- current implemented behavior:
  - `intergrade` uses ` - `
  - otherwise multi-parent output uses ` × `
- these are built directly from `taxon_name_parents`

## Parent-Link Rules

### Single parent

A single parent can mean different things depending on rank:

- species context inheritance
- infraspecific context inheritance
- genus context for higher-rank infrageneric names
- infrageneric overlay input

So single-parent logic must remain rank-aware.

### Multiple parents

Multiple parents are interpreted as hybrid/intergrade composition.

### No parent

If there is no parent link:

- the engine uses parallel fields and stored data
- hierarchy may still contribute context where implemented
- strict mode is useful for revealing whether the result still depends on old
  fallback behavior

## Hierarchy Rules

### Hierarchy can create parent links

For higher-rank infrageneric records such as `Subgenus`, the backfill can use
`hierarchy.parent_nid` to create a `taxon_name_parent` row when there is a clear
direct hierarchy parent.

Example:

- `Subgenus Leucocalocybe`
- hierarchy parent genus: `Collybia`
- resulting parent link: `Leucocalocybe -> Collybia`

### Hierarchy is not the same as parent composition

Hierarchy and parent composition remain different concepts:

- hierarchy answers placement
- `taxon_name_parents` answers name composition/context

Hierarchy may be used to seed or confirm parent links, but it does not replace the
parent-link model.

## Parallel Uninomial Rules

### Parent-derived default

If a parent-derived uninomial matches the stored/current uninomial, the redundant
parallel uninomial can be cleared so the parallel engine falls back to the parent
context instead of storing duplicate text.

### Explicit override

If the parallel uninomial must differ from the parent-derived value, it should be
stored explicitly in `parallel_override_uninomial`.

The UI currently supports:

- showing the parent-derived default as a badge
- switching into override mode
- switching back to parent mode without losing the unsaved typed value before save

## Strict Mode Rules

Strict output means:

- the parallel engine must rely only on:
  - parallel fields
  - parent links
  - hierarchy-fed parent context where explicitly implemented
  - explicit strict formatting rules already implemented
- if a name still fails or degrades, that indicates a missing strict rule rather
  than acceptable transitional behavior

Current strict rules now implemented include:

- higher-rank infrageneric formatting from linked genus parent plus parallel
  infrageneric field
- species and infraspecific bracketed infrageneric formatting from linked
  infrageneric parent
- recovery of missing infraspecific rank abbreviations from the taxon rank
  definition
- semantic hybrid-formula rendering from hybrid state rather than raw `uninomial`
  text
- reuse of stored bracketed components where they are the strict source of truth
- preservation of repeated bracketed infrageneric forms such as `Genus (Genus)
  species`

## Current Agreed Interpretation

At the current stage:

- species and below should increasingly be driven from parent context plus parallel
  fields
- higher-rank infrageneric names should use linked genus context plus parallel
  infrageneric fields
- bracketed infrageneric scientific names should not replace canonical genus-level
  treatment
- repeated bracketed infrageneric scientific names should remain bracketed in
  strict output rather than being collapsed
- hybrids should be assembled from ordered parent rows
- hierarchy may be used to seed parent links, especially for infrageneric ranks

## Why Similar Cases Need Different Rules

These are the main structure families that have repeatedly looked similar during
implementation, but are not interchangeable:

- higher-rank infrageneric names
  - example: `Collybia (subg. Leucocalocybe)`
  - parent supplies genus context, child supplies infrageneric component
- species with a different infrageneric overlay
  - example: `Lophopagurus (Australeremus) triserratus`
  - bracketed component is overlay context, not canonical replacement
- species with a repeated infrageneric overlay
  - example: `Acartia (Acartia) danae`
  - repeated bracket is still meaningful strict output and must be preserved
- infraspecific repeated forms
  - examples:
    - `subsp. x`
    - `Genus species species`
  - repeated lower segments can be valid or invalid depending on the current-name
    pattern
- hybrid or intergrade formulas
  - example: `× Cyanthera`
  - multiplication sign is derived from hybrid semantics, not stored in the raw
    name component

So when two records “look similar”, the first question should be:

- which pattern family is this?

Only after that should kingdom-specific rules be considered.

## Open Follow-Up Questions

These are the main remaining items to confirm with the herbarium team:

- whether genus-level canonical retention for higher-rank infrageneric names is the
  correct long-term convention in all kingdoms
- whether additional infrageneric ranks need special treatment beyond the current
  grouped rule
- whether any author-placement rules need to be re-expressed explicitly in the new
  parallel engine rather than inherited from current stored author formatting
- whether any hybrid naming categories need more than the current separator logic

## Related Notes

- [Hybrid Parent Model Proposal](./hybrid-parent-model.md)
- [Parallel Name Engine Proposal](./parallel-name-engine-proposal.md)
- [Parent Name Change Propagation Proposal](./parent-name-change-propagation.md)
- [Hybrid And Parallel Name Rollout Runbook](./hybrid-rollout-runbook.md)
