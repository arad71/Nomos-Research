export const parseDateOnlyToDateTime = (value?: string | null) => {
  if (!value) {
    return value ?? "";
  }

  return `${value}T00:00:00`;
};

export const formatDateOnly = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString();
};
