# Hybrid Parent Model Proposal

## Purpose

This document proposes a new `taxon_name_parents` model to support hybrid names and future parent-name composition use cases without overloading the existing `hierarchies` model.

It is intended as a briefing note for the technical team working on the Hybrids PR and related follow-up work.

Related follow-up design note:

- [Parent Name Change Propagation Proposal](./parent-name-change-propagation.md)
- [Parallel Name Engine Proposal](./parallel-name-engine-proposal.md)
- [Parallel Name Rules Matrix](./parallel-name-rules-matrix.md)
- [Hybrid And Parallel Name Rollout Runbook](./hybrid-rollout-runbook.md)

## Executive Summary

### Recommendation

Introduce a new join table named `taxon_name_parents` and keep the existing `uninomial` text field during a transition period.

Do not extend or repurpose `hierarchies` for this work.

### Why

The current `uninomial` field is a single text value. That is not a good long-term model for:

- hybrid names that need to reference multiple parents
- preserving the order of parent names
- generating a display value using a multiplication marker such as `×`
- validating parent relationships consistently
- backfilling and comparing legacy values safely

The existing `hierarchies` table appears to represent taxonomic placement within a classification system. That is a different concern from parent-name composition for hybrids.

### Proposed Direction

1. Add a new normalized relationship table: `taxon_name_parents`
2. Keep legacy `uninomial` during migration
3. Generate a new derived uninomial/display value from ordered parent rows
4. Backfill parent relationships where possible
5. Compare legacy and generated values until confidence is high
6. Switch application reads to the normalized model
7. Retire legacy `uninomial` later

## Problem Statement

Today, `uninomial` is treated as a plain text field on taxon names.

In the frontend, it is currently surfaced as a direct text input in the taxon name form and is used directly in list filtering and sorting. This works for a simple one-value model, but it does not model parent relationships.

Hybrids introduce new requirements:

- a taxon name may need one or more parents
- parent order matters
- the display text may need to be generated from multiple linked parents
- the data needs to remain queryable and reviewable during rollout

Trying to fit these requirements into a single text field will create inconsistency and make backfill and QA harder.

## Why `hierarchies` Should Not Be Reused

Although both models involve links between taxon names, they represent different semantics.

### `hierarchies` represents taxonomic placement

Characteristics of the current hierarchy model:

- tied to a classification system
- uses a parent-child structure
- appears to support tree/path semantics
- answers the question: "Where does this taxon sit in a classification?"

### `taxon_name_parents` would represent parent-name composition

Characteristics of the proposed parent model:

- not inherently tied to a classification system
- supports multiple parents
- requires explicit ordering
- answers the question: "Which parent names compose or define this name?"

### Conclusion

These are different business concepts. Reusing `hierarchies` would likely mix incompatible meanings into one table and produce:

- confusing API behavior
- nullable columns with mixed semantics
- brittle validation rules
- harder long-term maintenance

For that reason, `taxon_name_parents` should be introduced as a separate model.

## Proposed Data Model

### Table name

`taxon_name_parents`

### Suggested columns

Minimum recommended shape:

- `taxon_name_parent_id` primary key
- `taxon_name_id` foreign key to child taxon name
- `parent_taxon_name_id` foreign key to parent taxon name
- `sequence` integer for explicit ordering

Potential future columns if needed:

- `relationship_type`
- `notes`
- `created_on`
- `created_by`
- `updated_on`
- `updated_by`

### Constraints

Recommended constraints:

- foreign key from `taxon_name_id` to `taxon_names`
- foreign key from `parent_taxon_name_id` to `taxon_names`
- unique constraint on `taxon_name_id + sequence`
- optional unique constraint on `taxon_name_id + parent_taxon_name_id` if duplicate parents should not be allowed
- check constraint to prevent `taxon_name_id = parent_taxon_name_id`

### Indexing

Recommended indexes:

- index on `taxon_name_id`
- index on `parent_taxon_name_id`
- index on `(taxon_name_id, sequence)`

These will support:

- loading parent rows for a child name
- finding all child names that reference a parent
- deterministic ordered display generation

## Why a Join Table Is Better Than Storing Parent Fields on `taxon_names`

An alternative would be adding fields such as:

- `parent_1_taxon_name_id`
- `parent_2_taxon_name_id`
- `hybrid_operator`

This would only be simpler if the domain is permanently constrained to exactly two parents with very limited behavior.

That approach has several downsides:

- poor extensibility if more than two parents are needed
- awkward validation rules
- harder to reuse for both single-parent and multi-parent cases
- difficult to query consistently
- future schema churn if requirements expand

A join table is more durable and keeps one consistent relationship model for:

- names with no parents
- names with one parent
- names with multiple parents

## Display Value Strategy

### Transitional recommendation

Keep the existing `uninomial` field during rollout, but introduce a new generated or derived value based on `taxon_name_parents`.

Suggested names:

- `generated_uninomial`
- `derived_uninomial`
- `display_uninomial`

The exact name can be chosen by the backend team.

### Why keep both during rollout

This allows the team to:

- backfill incrementally
- compare old and new values side by side
- identify mismatches before cutover
- avoid breaking existing search and edit flows

### Important implementation note

The duplicated/generated value should ideally not be freely hand-edited long term. If it is editable, it will drift away from the normalized parent links.

The long-term source of truth should be:

- parent relationships in `taxon_name_parents`
- formatter logic that generates the display value

## Formatting Rules

The final formatting rules should be owned centrally, ideally in backend/domain logic rather than spread across the frontend.

At a high level:

- one parent row: generated value can resolve to that parent's display value
- multiple parent rows: generated value is assembled in `sequence` order
- multiplication marker such as `×` is applied by formatter logic

If domain rules become more complex, they can evolve inside one formatter without requiring schema changes.

## Create and Edit Flow

### Key point

The parents already exist before the child is created.

That means the UI does not need to create parent taxon names. It only needs to link existing parent names to the child taxon name.

### Recommended admin flow

Use a related-record UI pattern for `taxon_name_parents`, likely as a grid or inline related section.

This is preferable to trying to store hybrid structure inside one free-text input.

### Why a grid works well

A datagrid or related-record editor can show:

- parent name
- sequence
- optional derived display preview

This works for:

- a single linked parent
- multiple linked parents
- exact custom ordering

### Creation-time behavior

The only limitation is that join-table rows cannot be persisted until the new child `taxon_name_id` exists.

Standard approaches:

- save the taxon name first, then add `taxon_name_parents`
- or support an atomic backend create endpoint that accepts parent rows together with the taxon payload

The first option is simpler for the admin UI.
The second option is cleaner if the backend wants strict transactional guarantees.

## React Admin Direction

At a high level, the proposed frontend shape is:

- taxon name main form remains on `taxon_names`
- related parent section uses `taxon_name_parents`
- list is ordered by `sequence`
- each row references an existing `parent_taxon_name_id`

This is a natural fit for a related-record section or datagrid.

It is also simpler than replacing `uninomial` with a single lookup field, because the join-table approach already supports:

- one parent
- many parents
- deterministic order

## Migration Plan

### Phase 1: Schema

Add:

- `taxon_name_parents`
- optional generated/cache display field if desired

Keep:

- current `uninomial`

### Phase 2: API support

Add CRUD support for:

- reading parent rows by `taxon_name_id`
- creating and updating parent rows
- deleting parent rows

Add derived display support if the backend will own formatting.

### Phase 3: UI support

Add a related parent grid or related editor to the taxon name page.

Keep current `uninomial` visible during transition if the business wants comparison.

### Phase 4: Backfill

Backfill `taxon_name_parents` from existing `uninomial` values where matching is reliable.

Recommended backfill behavior:

- create links automatically for unambiguous matches
- preserve order where it can be inferred
- leave unresolved rows for manual review
- generate comparison output between legacy and derived values

### Phase 5: Verification

Run reports on:

- matched rows
- unmatched rows
- ambiguous rows
- legacy `uninomial` versus derived uninomial mismatches

### Phase 6: Cutover

Switch reads to the normalized model after the mismatch rate is low enough and the business is confident in the results.

### Phase 7: Retirement

Once confidence is established:

- retire legacy `uninomial`
- or keep it only as a derived/cache field if still useful for search or export

## Backfill Considerations for 170,000 Records

The record volume is significant but still very manageable if the backfill is done server-side.

Recommended approach:

- use SQL or a resumable backend batch job
- process in chunks
- log unresolved and ambiguous cases
- avoid frontend-driven migration logic

### Main risks

- dirty or inconsistent legacy text
- multiple possible parent matches
- hybrid text that cannot be parsed reliably
- old data that does not follow one naming convention

### Mitigation

- do not force every row into a parent link
- allow null/unresolved states during migration
- publish mismatch and exception reports

## Search and Sort Considerations

If the application still needs fast filtering/sorting by a displayed uninomial value, consider keeping a denormalized cache field populated from the normalized parent model.

That provides:

- normalized source of truth in `taxon_name_parents`
- cheap list filtering and sorting
- easy QA comparison during migration

This is often preferable to forcing every list view to build display strings from joins at runtime.

## Risks and Tradeoffs

### Main benefits

- supports hybrids correctly
- supports one or many parents
- preserves order explicitly
- keeps name composition separate from classification hierarchy
- provides a safe migration path

### Main tradeoffs

- additional table and API surface
- two-phase create flow unless atomic backend support is added
- backfill and comparison work required before cutover

## Recommended Team Decision

The team should proceed with:

- a new `taxon_name_parents` join table
- explicit `sequence` ordering
- a derived uninomial/display strategy
- retention of the current `uninomial` during transition
- no extension of `hierarchies` for hybrid parentage

## Open Questions for Implementation

These items should be confirmed before build starts:

1. What is the exact formatting rule for one parent versus multiple parents?
2. Is the multiplication marker always `×`, or does it vary by business rule?
3. Should duplicate parent rows ever be allowed for the same child?
4. Does the backend want atomic create/update support, or is a two-phase admin flow acceptable?
5. Will the derived uninomial be stored physically, computed on read, or both?
6. What confidence threshold is required before legacy `uninomial` can be retired?

## Suggested Next Step

The next practical step is to align backend and frontend on:

- the table contract for `taxon_name_parents`
- the derived display-field strategy
- the backfill/mismatch reporting approach

Once that is agreed, implementation can be split cleanly across schema, API, UI, and migration work.
