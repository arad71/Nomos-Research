import { describe, expect, it } from 'vitest';
import { normalizeTaxonNameHybridFields } from './hybridFields';

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
});
