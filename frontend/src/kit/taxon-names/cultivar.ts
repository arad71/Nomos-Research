const QUOTE_CHARACTER_PATTERN = /['"`\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F]/;

export const normalizeCultivarEpithet = (value?: string | null) =>
  value ? value.trim().replace(/\s+/g, ' ') : '';

export const hasCultivarEpithet = (value?: string | null) =>
  normalizeCultivarEpithet(value).length > 0;

export const validateCultivarEpithet = (value?: string | null) => {
  const normalized = normalizeCultivarEpithet(value);

  if (normalized && QUOTE_CHARACTER_PATTERN.test(normalized)) {
    return 'Store cultivar epithets without quote characters';
  }

  return undefined;
};

export const parseCultivarEpithet = (value?: string | null) => {
  const normalized = normalizeCultivarEpithet(value);
  return normalized || null;
};

export const titleCaseCultivarEpithet = (value?: string | null) =>
  normalizeCultivarEpithet(value)
    .toLocaleLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (match, prefix: string, letter: string) =>
      `${prefix}${letter.toLocaleUpperCase()}`
    );

export const formatCultivarEpithetForDisplay = (value?: string | null) => {
  const titleCased = titleCaseCultivarEpithet(value);
  return titleCased ? `\u2018${titleCased}\u2019` : '';
};
