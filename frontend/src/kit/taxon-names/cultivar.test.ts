import {
  formatCultivarEpithetForDisplay,
  normalizeCultivarEpithet,
  parseCultivarEpithet,
  validateCultivarEpithet,
} from './cultivar';

describe('cultivar formatting', () => {
  it('normalizes storage values without forcing case', () => {
    expect(normalizeCultivarEpithet('  merlom   Ruby  ')).toBe('merlom Ruby');
    expect(parseCultivarEpithet('   ')).toBeNull();
  });

  it('rejects quote characters in raw cultivar epithets', () => {
    expect(validateCultivarEpithet("'Bluff Cream'")).toBe(
      'Store cultivar epithets without quote characters'
    );
    expect(validateCultivarEpithet('Bluff Cream')).toBeUndefined();
  });

  it('adds display quotes and title case without mutating the base name', () => {
    expect(formatCultivarEpithetForDisplay('merlom ruby')).toBe('\u2018Merlom Ruby\u2019');
  });
});
