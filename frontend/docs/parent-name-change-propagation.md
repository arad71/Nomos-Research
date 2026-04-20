# Parent Name Change Propagation Proposal

## Purpose

This document describes how Nomos should handle cases where a parent taxon name changes and that change affects child names derived from `taxon_name_parents`.

It is a follow-on design note to the Hybrids and parent-link work. The goal is to avoid silently mutating child names in place when their authoritative constructed names change.

## Executive Summary

### Recommendation

When a parent-name change causes a child's authoritative generated name to change:

1. Do not update the child taxon name in place.
2. Create a new child `taxon_name` record.
3. Create a cross reference from the old child name to the new child name.
4. Copy or re-establish the relevant parent links on the new child name.
5. Keep the old child name as the historical predecessor according to existing current/non-current rules.

### Why

If the child's generated authoritative name changes, that is a new name state, not just a display refresh.

Updating the existing child record in place would make it difficult to:

- preserve historical traceability
- explain why a name changed
- maintain clean current/non-current name history
- audit downstream impacts

## Core Principle

`taxon_name_parents` is not just a convenience for display generation.

Once the system uses parent links to construct authoritative names, parent changes become name dependencies. If a parent dependency changes the authoritative output, the child should move to a successor name record.

## Scope

This workflow is relevant when all of the following are true:

- the child name is in scope for generated parent-based naming
- the child has one or more `taxon_name_parents`
- a parent name changes or is superseded
- the generated child output changes as a result

This is expected to matter most for:

- species and below
- hybrids
- intergrades
- any future rank/type whose output depends on linked parent names

This is not expected to apply to:

- genus and above, where `uninomial` remains a stored string
- cases where the generated child output does not actually change

## Trigger Conditions

The system should identify impacted children when any of the following happens:

- a parent taxon name is replaced by a new current name
- a cross reference indicates a name change from old parent to new parent
- a parent linked through `taxon_name_parents` becomes non-current and a successor is created
- a manual editorial action changes a parent field used in authoritative generation

## Decision Rule

For each child linked to the changed parent:

1. Resolve the child's current generated authoritative name before the parent change.
2. Resolve the child's proposed generated authoritative name after the parent change.
3. Compare the two.

If the generated output is unchanged:

- no successor child is required
- the child can remain linked as-is, or links can be repointed as a maintenance step if desired

If the generated output changes:

- create a new child taxon name
- cross-reference old child to new child
- treat the old child as superseded

## Proposed Workflow

### 1. Detect impacted children

Given a changed parent taxon name, find all active child rows in `taxon_name_parents` where:

- `parent_taxon_name_id = changed_parent_id`

### 2. Compute proposed successor output

For each impacted child:

- load all linked parent rows
- substitute the changed parent with the new current parent where relevant
- run the authoritative name generator
- compare to the current child's stored/generated authoritative name

### 3. Split results into two buckets

#### No name change

If the authoritative child output does not change:

- no new child taxon name is required
- optionally flag for maintenance if parent links should be repointed to the successor parent

#### Name change required

If the authoritative child output changes:

- create a successor child `taxon_name`
- copy the relevant metadata from the old child
- attach the correct parent links to the new child
- create the cross reference from old child to new child
- update current/non-current flags under the established naming rules

### 4. Review and approval

This should start as a controlled workflow, not a fully automatic background mutation.

Recommended flow:

- identify impacted children
- generate proposed successor names
- present them in an admin queue
- allow review/approval
- then create successor child records and cross references

## Data Model Implications

### Existing models involved

- `taxon_name`
- `taxon_name_parents`
- name cross-reference model already used by Nomos

### Suggested future support table

If operational volume is high, introduce a lightweight queue table such as:

- `taxon_name_change_impact`

Suggested fields:

- `taxon_name_change_impact_id`
- `source_parent_taxon_name_id`
- `old_child_taxon_name_id`
- `proposed_child_taxon_name`
- `requires_successor`
- `status`
- `reason`
- `review_notes`
- `reviewed_by`
- `reviewed_on`

Suggested statuses:

- `pending`
- `approved`
- `applied`
- `ignored`
- `blocked`

This keeps the propagation workflow separate from the initial parent-backfill review queue.

## Generation Rules

The propagation workflow depends on one authoritative generator for constructed name output.

That generator should be:

- rank-aware
- hybrid-category-aware
- sequence-aware where sequence is authoritative
- override-aware for manual exceptions

Without one shared generator, propagation decisions will become inconsistent.

## Manual Override Requirement

Some child names will need editorial exceptions.

Recommended future support:

- `name_generation_mode = auto | manual`
- explicit override fields for generated parts or final authoritative name

If a child is in manual mode:

- propagation should not silently create a successor
- it should instead produce a review item for human decision

## Recommended Rollout

### Phase 1

- do not auto-propagate parent changes yet
- document the dependency model
- ensure new parent-based names can be regenerated deterministically

### Phase 2

- build an impacted-children detector
- create an admin queue for proposed successor names
- support approval workflow

### Phase 3

- optionally automate safe low-risk successor creation
- keep manual review for edge cases and override-controlled names

## Operational Example

Example:

1. Parent A is replaced by Parent B.
2. Child X currently derives its authoritative output using Parent A.
3. Re-running the generator with Parent B changes Child X's authoritative name.
4. Nomos creates:
   - new child name `X2`
   - cross reference `X -> X2`
   - parent links on `X2`
5. Old child `X` remains as the historical predecessor and is no longer the current name if that matches the code rules.

## Open Questions

The technical team should confirm:

- which cross-reference type should represent old child to new child succession
- whether successor creation should copy all child metadata or only a selected subset
- whether parent links should be repointed immediately for unchanged children
- how manual override records should block or alter propagation
- whether propagation applies only to current names or also to historical names

## Recommendation For Now

Do not implement automatic child renaming yet.

Instead:

1. treat parent changes as a future successor-creation workflow
2. keep the current parent-link and review-queue work focused on stable matching
3. design one authoritative name generator before building propagation automation

That sequence keeps the current Hybrids work manageable while preserving a clean path for the more complex name-change workflow.
