import PublicationReferenceType from './PublicationReferenceType';

const publicationReferenceTypeLabelMap = PublicationReferenceType.reduce<Record<string, string>>(
  (labels, option) => ({
    ...labels,
    [option.id]: option.name,
    [option.id.toLowerCase()]: option.name,
  }),
  {}
);

export const getPublicationReferenceTypeLabel = (value?: string | null) =>
  value
    ? publicationReferenceTypeLabelMap[value] ??
      publicationReferenceTypeLabelMap[value.toLowerCase()] ??
      value
    : '';
