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

  it('normalizes cultivar epithet on submit without preventing spaces while typing', () => {
    expect(
      normalizeTaxonNameHybridFields({
        is_hybrid: false,
        has_cultivar: true,
        cultivar_epithet: '  Bluff   Cream  ',
      }).cultivar_epithet
    ).toBe('Bluff Cream');
  });

  it('clears cultivar epithet on submit when cultivar is toggled off', () => {
    const normalized = normalizeTaxonNameHybridFields({
      has_cultivar: false,
      cultivar_epithet: 'Bluff Cream',
    });

    expect(normalized.cultivar_epithet).toBeNull();
    expect('has_cultivar' in normalized).toBe(false);
  });
});
