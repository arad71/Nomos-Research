# Hybrid Naming Rules Brief

## Purpose

This note is intended for discussion with Herbarium and Bio Science Officer
stakeholders.

It explains the current hybrid-related naming rules in the new strict parallel
name engine in plain language, without going into implementation detail or
internal error analysis.

It is intended to support discussion of:

- how parent links are being used
- how hybrid formulas are being assembled
- where the new rules are already working well
- which small set of names may still need manual intervention

## Current Position

The new strict parallel naming process now reproduces the current register very
closely.

At present:

- the matching process is down to about 20 records out of roughly 147,000 current
  names that appear to need further manual intervention
- the remaining cases are concentrated in unusual names, especially around newer
  hybrid rules and parent-link interpretation

The key point for stakeholder discussion is that the hybrid and parent-link model
is now stable enough to review as a rule set.

## Core Principle

The new model separates:

- taxonomic placement
- name composition

This matters because a parent in the hierarchy is not always the same thing as a
parent used to build the displayed scientific name.

In the new model:

- hierarchy may help provide placement context
- ordered `parent name` links are used to build hybrid formulas and some derived
  name structures

## Hybrid Rules

### 1. Multiple parent links indicate a hybrid or intergrade formula

If a name has more than one ordered parent link, the strict engine treats it as a
formula assembled from those linked parents.

This is the basis for hybrid-derived names.

### 2. Parent order matters

Parent rows are used in their stored order.

That means:

- sequence is meaningful
- the displayed formula follows that sequence

### 3. Separator depends on hybrid type

Current rule:

- intergrades use ` - `
- other hybrid formulas use ` × `

### 4. The multiplication sign is semantic

For named hybrids such as `× Cyanthera`, the multiplication sign is no longer
treated as raw stored text inside the base name component.

Instead:

- the underlying name component is stored without the sign
- hybrid state is stored explicitly
- the strict engine renders the leading `×` from that hybrid state

This keeps the naming logic cleaner and more consistent.

### 5. Shared leading genus should not be repeated unnecessarily

Where both sides of a hybrid formula share the same genus, the strict engine now
compacts the repeated genus on the second side.

Example pattern:

- before: `Senna artemisioides subsp. petiolaris × Senna glutinosa subsp. chatelainiana`
- now: `Senna artemisioides subsp. petiolaris × glutinosa subsp. chatelainiana`

This rule is especially important for newly modelled same-genus hybrid formulas.

## Parent-Link Rules

### 1. Parent links are rank-aware

Not every linked parent is valid for name derivation.

The strict engine only allows parent links that make sense for the rank of the
child name.

This prevents invalid situations such as:

- a genus deriving from a child species
- a higher-rank name inheriting from an unrelated lower-rank context

### 2. Single parent links can mean different things

A single parent link can supply different kinds of naming context depending on the
rank:

- genus context for species
- species context for infraspecific names
- genus context for higher-rank infrageneric names
- infrageneric overlay context for names with bracketed subgeneric structure

So a single parent link is not interpreted the same way in every case.

### 3. Hierarchy can seed parent context

For some ranks, especially higher-rank infrageneric names such as subgenera,
hierarchy can be used to help create or confirm the relevant parent link.

This is useful where simple name matching would not find the correct parent.

## Bracketed Infrageneric Rules

Some names include bracketed infrageneric structure.

These are important because they can look similar while actually belonging to
different rule families.

### 1. Higher-rank infrageneric names

Example pattern:

- `Collybia (subg. Leucocalocybe)`

Rule:

- the linked parent provides the genus context
- the child’s own parallel field provides the infrageneric component

### 2. Species with infrageneric overlay

Example pattern:

- `Lophopagurus (Australeremus) triserratus`

Rule:

- the bracketed part is overlay context
- it does not replace the genus
- the species still keeps its own genus and epithet structure

### 3. Repeated bracketed forms are still valid

Example pattern:

- `Acartia (Acartia) danae`

Rule:

- even where the bracketed component repeats the genus, it can still be a valid
  scientific name form
- the strict engine now preserves that bracketed form rather than collapsing it

## Why Some Cases Need Manual Discussion

The remaining small set of unresolved names is not random.

They tend to cluster around cases such as:

- newly modelled hybrid formulas
- unusual parent-link interpretation
- special literal group labels or placeholders
- records where the current stored name may itself be stale and need refreshing

So the main value of stakeholder review is not to revisit the whole register. It
is to confirm the handling of these unusual edge cases.

## Questions For Stakeholder Discussion

These are the main questions this brief is intended to support:

- when two parent-linked names share the same genus, is the compact hybrid form
  the preferred presentation?
- are there hybrid patterns that should still repeat the genus on both sides?
- when a name is formula-like but not a standard hybrid formula, should it be
  modelled through parent links or treated as a stored special case?
- for higher-rank infrageneric names, is genus-level canonical retention the
  correct convention across the relevant groups?
- are there special hybrid or parent-link conventions that should differ between
  major organism groups?

## Related Technical References

For the detailed technical implementation reference, see:

- [Strict Parallel Name Rules Matrix](./parallel-name-rules-matrix.md)
- [Hybrid Parent Model Proposal](./hybrid-parent-model.md)
- [Parallel Name Engine Proposal](./parallel-name-engine-proposal.md)
