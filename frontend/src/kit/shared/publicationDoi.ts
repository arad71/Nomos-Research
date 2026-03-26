type PublicationLike = {
  doi?: string | null;
  bhl_url?: string | null;
};

const DOI_URL_PREFIX = 'https://doi.org/';
const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

export const sanitizeExternalUrl = (value?: string | null) => {
  if (value == null) {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    if (!SAFE_PROTOCOLS.has(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
};

export const normalizeDoi = (value?: string | null) => {
  if (value == null) {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const withoutDoiPrefix = trimmed.replace(/^doi:\s*/i, '');

  if (/^https?:\/\//i.test(withoutDoiPrefix)) {
    return sanitizeExternalUrl(withoutDoiPrefix);
  }

  if (/^10\.\S+/i.test(withoutDoiPrefix)) {
    return `${DOI_URL_PREFIX}${withoutDoiPrefix}`;
  }

  return trimmed;
};

export const validateOptionalHttpUrl = (value?: string | null) => {
  if (!value?.trim()) {
    return undefined;
  }

  return sanitizeExternalUrl(value) ? undefined : 'Enter a valid http(s) URL';
};

export const validateOptionalDoi = (value?: string | null) => {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim().replace(/^doi:\s*/i, '');
  if (/^10\.\S+/i.test(trimmed)) {
    return undefined;
  }

  return sanitizeExternalUrl(trimmed) ? undefined : 'Enter a valid DOI or DOI URL';
};

export const transformPublicationPayload = <T extends PublicationLike>(data: T): T => ({
  ...data,
  doi: normalizeDoi(data.doi),
  bhl_url: sanitizeExternalUrl(data.bhl_url),
});
