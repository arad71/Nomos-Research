# Parallel Name Engine Proposal

## Purpose

This document proposes a parallel name-generation engine for Nomos.

Current rule reference:

- [Parallel Name Rules Matrix](./parallel-name-rules-matrix.md)

The goal is to build the new parent-aware and hierarchy-aware naming logic alongside
the current system, rather than replacing the current calculation path immediately.

This allows the team to:

- keep the current naming logic as a fallback
- test the new logic safely
- compare outputs at scale
- handle hybrids, infrageneric names, and normal inherited naming without forcing
  them into one risky cutover

## Recommendation

Build the next-generation name builder in parallel and keep the current calculator
authoritative until confidence is high.

### Why

The new naming logic is not a small tweak.

It needs to handle at least three different patterns:

- standard species-and-below inherited naming
- Animalia-style infrageneric naming built from hierarchy
- hybrid/intergrade naming built from linked parent names

That is enough complexity that a side-by-side rollout is the safer path.

## Current State

Nomos already has an established name calculation path.

Important observations:

- the current calculator builds `scientific_name` and `formatted_scientific_name`
- Animalia infrageneric patterns such as `Genus (Subgenus) species` are already being
  generated from hierarchy
- the new `taxon_name_parents` work introduces a different source of name parts
- some cases will still require manual override because not all needed parents will
  exist in Nomos

## Proposed Parallel Architecture

### Keep the current engine

The existing calculation path remains the live source of truth during rollout.

This means:

- existing `scientific_name` remains authoritative
- existing `formatted_scientific_name` remains authoritative
- current data-entry flows continue to work

### Add a new parallel engine

Introduce a second generator service that computes proposed next-generation outputs
without immediately replacing the current fields.

Suggested outputs:

- `derived_uninomial_next`
- `derived_scientific_name_next`
- `derived_formatted_scientific_name_next`
- `derived_name_source_next`
- `derived_name_status_next`

These names are placeholders. The backend team can choose the final field names or
store them in a separate preview/review model instead of on `taxon_name`.

### Fallback principle

The new engine should never block the current system during rollout.

If the new engine cannot fully determine a name:

- it should fall back to current authoritative values for display
- or mark the result as incomplete/review-required

## Name Sources The New Engine Must Support

### 1. Standard inherited naming

For species and below:

- use linked parent records where available
- use immediate species parent context where appropriate
- derive inherited parts from the linked parent and its hierarchy placement

### 2. Infrageneric hierarchy naming

For names like:

- `Heteromysis (Olivemysis) abrucei`

the new engine must support:

- genus from hierarchy or immediate parent context
- infrageneric component from hierarchy ranks between genus and species
- species epithet from the child record

### 3. Hybrid naming

For:

- `named_hybrid`
- `hybrid_formula`
- `intergrade`

the new engine must support:

- linked parent components from `taxon_name_parents`
- category-specific separators and rules
- rank-aware placement of generated parts

### 4. Manual overrides

If required parent or hierarchy information is missing:

- the new engine must support manual override
- the override should apply only to the new engine at first

## Suggested Data Strategy

There are two workable storage options.

### Option A: Store next-generation outputs directly on `taxon_name`

Example fields:

- `derived_scientific_name_next`
- `derived_formatted_scientific_name_next`
- `derived_uninomial_next`
- `derived_name_status_next`
- `derived_name_source_next`

Pros:

- easy to query and compare
- simple for admin UI

Cons:

- adds more transitional columns to `taxon_name`

### Option B: Store next-generation outputs in a separate preview table

Example table:

- `taxon_name_generated_preview`

Suggested columns:

- `taxon_name_id`
- `derived_uninomial`
- `derived_scientific_name`
- `derived_formatted_scientific_name`
- `generation_source`
- `generation_status`
- `comparison_status`
- `notes`
- `updated_on`

Pros:

- keeps transitional rollout state separate from core taxon fields
- easier to rebuild and refresh

Cons:

- more moving pieces

For this rollout, a separate preview table may be the cleaner option.

## Suggested Status Model

The new engine should classify each result.

Suggested statuses:

- `exact_match`
- `different_but_explained`
- `missing_parent`
- `missing_hierarchy`
- `manual_override_required`
- `error`

Suggested comparison statuses:

- `matches_current`
- `differs_from_current`
- `not_comparable`

## Suggested Source Model

Track where the proposed name came from.

Suggested values:

- `current_calculation_fallback`
- `parent_links`
- `hierarchy_infrageneric`
- `parent_links_plus_hierarchy`
- `manual_override`

This will make debugging and review much easier.

## Override Strategy

Manual override should be built into the parallel engine from the start.

Suggested approach:

- `name_generation_mode_next = auto | manual`
- override fields for proposed generated parts or final generated name

Suggested overrides:

- `override_uninomial_next`
- `override_infrageneric_name_next`
- `override_specific_epithet_next`
- `override_scientific_name_next`
- `override_formatted_scientific_name_next`

If override fields are used:

- the new engine should report `generation_source = manual_override`
- comparison with the current system should still be shown

## Review Workflow

The admin side should compare:

- current authoritative values
- next-generation derived values
- the source of the derived value
- whether the record used override

This can be shown:

- in the taxon detail/edit view
- in a dedicated review queue for mismatches and incomplete records

## Rollout Stages

### Stage 1

Build the parallel engine only.

- no cutover
- no replacement of current scientific name fields
- output visible only in admin/review tooling

### Stage 2

Run the engine across the dataset and compare outputs.

- identify exact matches
- isolate known pattern groups
- route unresolved cases into review

### Stage 3

Add override support for records where parent/hierarchy information is missing.

### Stage 4

Decide whether to cut over specific pattern groups first.

Possible phased cutover:

- standard species inheritance first
- then infrageneric hierarchy cases
- then hybrids

### Stage 5

Retire or downgrade the old naming engine only when:

- mismatch rate is acceptable
- review process is stable
- override support is in place

## Why This Is Worth Doing

Parallel build-out reduces risk in all the places where the current and next systems
diverge most:

- bracketed infrageneric Animalia names
- hybrid parent composition
- partial data where parents do not exist in Nomos

It also gives the team operational confidence because there is always a known-good
fallback.

## Recommendation For The Team

Proceed with a parallel engine rather than an in-place replacement.

Use the current naming system as the live fallback while the next-generation engine
is built, compared, and refined.

This approach is safer, easier to validate, and much better suited to the mixed
naming patterns already present in Nomos.
