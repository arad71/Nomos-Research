const LIST_LOCATION_PREFIX = 'kit.listLocation:';

const normalizeListKey = (listPath: string) => listPath.replace(/\/+$/, '') || '/';

export const rememberListLocation = (listPath: string, search: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedListPath = normalizeListKey(listPath);
  const nextValue = `${normalizedListPath}${search || ''}`;
  window.localStorage.setItem(`${LIST_LOCATION_PREFIX}${normalizedListPath}`, nextValue);
};

export const getRememberedListLocation = (listPath: string) => {
  if (typeof window === 'undefined') {
    return listPath;
  }

  const normalizedListPath = normalizeListKey(listPath);
  return (
    window.localStorage.getItem(`${LIST_LOCATION_PREFIX}${normalizedListPath}`) ??
    normalizedListPath
  );
};
