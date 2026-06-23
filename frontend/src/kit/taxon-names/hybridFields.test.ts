import { describe, expect, it } from 'vitest';
import {
  deriveParentValue,
  normalizeTaxonNameHybridFields,
  type ParentLinkRecord,
  type ParentTaxonRecord,
} from './hybridFields';

describe('normalizeTaxonNameHybridFields', () => {
  it('keeps explicit nulls for blank naturalised fields', () => {
    expect(
      normalizeTaxonNameHybridFields({
        is_hybrid: false,
        hybrid_category: null,
        naturalised_status: '',
        naturalised_certainty: '',
      })
    ).toMatchObject({
      naturalised_status: null,
      naturalised_certainty: null,
    });
  });

  it('preserves selected naturalised values', () => {
    expect(
      normalizeTaxonNameHybridFields({
        naturalised_status: 'alien',
        naturalised_certainty: false,
      })
    ).toMatchObject({
      naturalised_status: 'alien',
      naturalised_certainty: false,
    });
  });

  it('preserves duplicate named hybrid uninomial and specific overrides', () => {
    expect(
      normalizeTaxonNameHybridFields({
        is_hybrid: true,
        hybrid_category: 'named_hybrid',
        parallel_override_uninomial: 'danny',
        parallel_override_specific_epithet: 'danny',
      })
    ).toMatchObject({
      parallel_override_uninomial: 'danny',
      parallel_override_specific_epithet: 'danny',
    });
  });

  it('normalizes legacy hybrid markers in stored current name parts', () => {
    expect(
      normalizeTaxonNameHybridFields({
        specific_epithet: 'ampliceps x sclerosperma subsp. sclerosperma',
        infraspecific_epithet: 'alpha X beta',
        parallel_override_specific_epithet: 'foo x bob',
        parallel_override_infraspecific_epithet: 'x bob',
      })
    ).toMatchObject({
      specific_epithet: 'ampliceps × sclerosperma subsp. sclerosperma',
      infraspecific_epithet: 'alpha × beta',
      parallel_override_specific_epithet: 'foo × bob',
      parallel_override_infraspecific_epithet: '× bob',
    });
  });
});

describe('deriveParentValue', () => {
  const rows: ParentLinkRecord[] = [
    { parent_taxon_name_id: 2, sequence: 2 },
    { parent_taxon_name_id: 1, sequence: 1 },
  ];
  const parentTaxa = new Map<string, ParentTaxonRecord>([
    ['1', { id: 1, uninomial: 'ParentA' }],
    ['2', { id: 2, uninomial: 'ParentB' }],
  ]);

  it('builds a formula value from ordered parent rows', () => {
    expect(deriveParentValue(rows, parentTaxa, 'hybrid_formula')).toBe(
      'ParentA × ParentB'
    );
  });

  it('uses the intergrade separator for intergrades', () => {
    expect(deriveParentValue(rows, parentTaxa, 'intergrade')).toBe(
      'ParentA - ParentB'
    );
  });

  it('uses the first parent for named hybrids', () => {
    expect(deriveParentValue(rows, parentTaxa, 'named_hybrid')).toBe(
      'ParentA'
    );
  });

  it('can include bracketed scientific context for parent display values', () => {
    const bracketedParentTaxa = new Map<string, ParentTaxonRecord>([
      [
        '1',
        {
          id: 1,
          uninomial: 'Cicindela',
          scientific_name: 'Cicindela (Myriochile) mastersi Castelnau, 1867',
        },
      ],
    ]);

    expect(
      deriveParentValue(
        [{ parent_taxon_name_id: 1, sequence: 1 }],
        bracketedParentTaxa
      )
    ).toBe('Cicindela');
    expect(
      deriveParentValue(
        [{ parent_taxon_name_id: 1, sequence: 1 }],
        bracketedParentTaxa,
        null,
        { includeBracketedScientificContext: true }
      )
    ).toBe('Cicindela (Myriochile)');
  });

  it('can include bracketed canonical context for subgenus parent display values', () => {
    const bracketedParentTaxa = new Map<string, ParentTaxonRecord>([
      [
        '1',
        {
          id: 1,
          uninomial: 'Aedimorphus',
          canonical_name: 'Aedes (Aedimorphus)',
          scientific_name: 'Aedes (Aedimorphus) Theobald, 1903',
        },
      ],
    ]);

    expect(
      deriveParentValue(
        [{ parent_taxon_name_id: 1, sequence: 1 }],
        bracketedParentTaxa
      )
    ).toBe('Aedimorphus');
    expect(
      deriveParentValue(
        [{ parent_taxon_name_id: 1, sequence: 1 }],
        bracketedParentTaxa,
        null,
        { includeBracketedScientificContext: true }
      )
    ).toBe('Aedes (Aedimorphus)');
  });

});
