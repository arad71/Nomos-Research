# Strict Parallel Name Rules: Stakeholder Summary

## Purpose

This summary explains, in plain language, how strict parallel names are built
for review and rollout discussions.

It is intended for herbarium and Biodiversity Information Office stakeholders.

It is intentionally more detailed than a one-page brief so it can be used in
rule-review meetings.

## What the Strict Parallel Engine Uses

Strict parallel derived names are built from:

- linked parent names (in sequence order)
- parallel fields on the record:
  - `parallel_override_uninomial`
  - `parallel_override_specific_epithet`
  - `parallel_override_infraspecific_epithet`
- rank metadata (for things like `subsp.` and `var.`)
- author text
- hybrid flags (for named hybrids and hybrid formulas)

Strict derived names are **not** built from the legacy component fields:

- `uninomial`
- `specific_epithet`
- `infraspecific_epithet`

Those legacy fields remain important for current-name comparison and migration QA.

## Decision Order (How the Engine Decides)

When strict derived names are built, the logic is applied in this order:

1. Start with empty strict components (not legacy epithet fields).
2. Apply explicit parallel overrides if they are set.
3. Evaluate linked parent rows:
   - no parent
   - one parent
   - two or more parents (hybrid/intergrade formula)
4. Apply rank-specific assembly logic.
5. Apply hybrid display logic (if relevant).
6. Build:
   - canonical (no author)
   - scientific (canonical + author)

This order is important because explicit parallel overrides should not be
silently replaced by fallback inheritance.

## Parent Link Rules (Detailed)

### No parent links

- The engine can only use parallel overrides + rank metadata + author.
- If required pieces are missing (for example no specific epithet source for a
  species), output may be incomplete and should be reviewed.

### One parent link

- Parent rank is validated for child rank.
- If valid, parent can contribute genus/species/infrageneric context depending
  on the child rank.
- If a parallel override exists for the same component, the override wins.

### Two or more parent links

- Name is treated as hybrid/intergrade composition.
- Parent rows are used in `sequence` order.
- Formula separators:
  - ` × ` default
  - ` - ` for intergrade

## Override Precedence

For strict derived output:

- explicit parallel override > parent inheritance > blank

By component:

- uninomial:
  - `parallel_override_uninomial` wins when set
  - otherwise parent-derived value can be used
- specific epithet:
  - `parallel_override_specific_epithet` wins when set
  - otherwise inherited from parent path where defined
- infraspecific epithet:
  - `parallel_override_infraspecific_epithet` wins when set
  - otherwise inherited/inferred via rank rules where defined

## Rank-by-Rank Rules

## Author Placement (All Ranks)

- Canonical names do not include author text.
- Scientific names include author text at the end.

## Rank-by-Rank Rules

## Rank Parts Table (Strict Derived Output)

| Rank | Canonical parts | Scientific parts |
|---|---|---|
| `Genus` | `uninomial` | `uninomial + author` |
| `Species` | `uninomial + specific_epithet` | `uninomial + specific_epithet + author` |
| `Subspecies` | `uninomial + specific_epithet + subsp. + infraspecific_epithet` | canonical + `author` |
| `Variety` | `uninomial + specific_epithet + var. + infraspecific_epithet` | canonical + `author` |
| `Subvariety` | `uninomial + specific_epithet + subvar. + infraspecific_epithet` | canonical + `author` |
| `Form` | `uninomial + specific_epithet + f./forma + infraspecific_epithet` | canonical + `author` |
| `Subform` | `uninomial + specific_epithet + subf. + infraspecific_epithet` | canonical + `author` |
| `Subgenus` | parent genus canonical (Nomos convention) | `ParentGenus (subg. child_component) + author` |
| `Section` | parent genus canonical | `ParentGenus (sect. child_component) + author` |
| `Subsection` | parent genus canonical | `ParentGenus (subsect. child_component) + author` |
| `Series` | parent genus canonical | `ParentGenus (ser. child_component) + author` |
| `Subseries` | parent genus canonical | `ParentGenus (subser. child_component) + author` |

For multi-parent hybrid/intergrade formulas:

- canonical: `Parent1 × Parent2` (or `Parent1 - Parent2` for intergrade)
- scientific: canonical + `author`

### Genus and above

- Usually treated as stored parallel structure unless a specific parent-driven
  infrageneric rule applies.
- Scientific output is canonical head plus author.

Example:

- canonical: `Banksia`
- scientific: `Banksia L.f.`

### Species

- A single linked parent can supply genus context.
- If a parallel uninomial override is explicitly set, that value is kept.
- Species epithet comes from parallel specific override when provided.
- Scientific name is built as genus/species plus author.
- Infrageneric overlays (for bracketed subgenus context) are preserved where applicable.

Examples:

- single-parent genus inheritance:
  - parent genus: `Dodecastyla`
  - parallel specific: `berkeleyi`
  - derived scientific: `Dodecastyla berkeleyi Knox, 1971`
- species with subgenus overlay:
  - current style: `Acritus (Acritus) tasmaniae Lewis, 1892`
  - strict can preserve bracketed infrageneric context where configured

### Infraspecific ranks

Includes:

- subspecies
- variety
- subvariety
- form
- subform

Rules:

- Parent links can supply species context.
- Parallel overrides take precedence where set.
- Rank abbreviation is added from rank metadata (for example `subsp.`).
- Scientific name is built as full trinomial-style structure plus author.

Examples:

- `Prasophyllum macrostachyum subsp. macrostachyum`
- `Banksia dallanneyi var. dallanneyi A.R.Mast & K.R.Thiele`

In practice, this means:

- if species context comes from parent, that context is used
- if a parallel infraspecific override is missing, rank logic decides whether a
  fallback source is available

### Higher-rank infrageneric names

Includes:

- subgenus
- section
- subsection
- series
- subseries

Rules:

- Parent supplies genus context.
- Child parallel uninomial supplies the infrageneric component.
- Scientific output is parent genus + bracketed infrageneric component + author.
- Canonical remains genus-level in the current Nomos convention.

Example:

- parent genus: `Collybia`
- child rank: `Subgenus`
- child parallel uninomial: `Leucocalocybe`
- derived scientific: `Collybia (subg. Leucocalocybe) ...`

### Hybrid and intergrade formulas

- Two or more linked parents are combined in sequence.
- Separator is:
  - ` × ` for hybrids
  - ` - ` for intergrades
- Scientific name is parent formula plus author.

Examples:

- named hybrid style can render marker as `×` in the appropriate position.
- formula style can render:
  - `Acacia ampliceps × sclerosperma ...`
  - `ParentA - ParentB ...` for intergrades

## Current vs Derived in the UI (Important)

In preview screens:

- **Current** name fields are saved legacy values.
- **Derived** name fields are strict parallel outputs.

So differences do not automatically mean strict is wrong. They indicate either:

- a rule difference
- a parent-link context difference
- or legacy data that needs review/cleanup

## Why Mismatches Happen

Most mismatches come from one of these families:

- legacy spacing or punctuation differences
- bracketed infrageneric handling (`Genus (Genus)` style)
- parent-link gaps or invalid parent rank
- hybrid marker placement and separator conventions
- author ordering differences in legacy data

These can be triaged into:

- rule change needed
- data cleanup needed
- manual curation needed

## Manual Review Guidance

Manual review is usually required when:

- parent links are missing or ambiguous
- a record has conflicting historical genus context
- informal group labels are embedded in name strings
- author ordering/citation formatting differs but taxonomy is otherwise correct
- a hybrid needs explicit category confirmation

## Current Review Position

- Strict parallel rules are now explicit and testable.
- Remaining non-matching cases are expected to be a small, targeted set for
  manual review and data cleanup, rather than broad rule uncertainty.

## Related Documents

- [Strict Parallel Name Rules Matrix](./parallel-name-rules-matrix.md)
- [Hybrid Rules Stakeholder Brief](./hybrid-rules-stakeholder-brief.md)
- [Hybrid And Parallel Name Rollout Runbook](./hybrid-rollout-runbook.md)
