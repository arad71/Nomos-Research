export type AuthorDisplayRecord = {
  abbreviation?: string | null;
  display_name?: string | null;
  first_names?: string | null;
  surname?: string | null;
  initials?: string | null;
  discipline?: string | null;
};

const present = (value?: string | null) => value?.trim() || '';

export const getAuthorNameOrInitials = (author?: AuthorDisplayRecord | null) => {
  if (!author) return '';
  const fullName = [present(author.first_names), present(author.surname)].filter(Boolean).join(' ');
  return fullName || present(author.display_name) || present(author.initials);
};

export const formatAuthorOption = (author?: AuthorDisplayRecord | null) => {
  if (!author) return '';
  return [
    present(author.abbreviation),
    getAuthorNameOrInitials(author),
    present(author.discipline),
  ]
    .filter(Boolean)
    .join(' - ');
};
