export type TaxonNameHybridPayload = {
  is_hybrid?: boolean | null;
  hybrid_category?: string | null;
  naturalised_status?: string | null;
  naturalised_certainty?: boolean | string | null;
  parallel_override_uninomial?: string | null;
  parallel_override_specific_epithet?: string | null;
  parallel_override_infraspecific_epithet?: string | null;
  specific_epithet?: string | null;
  infraspecific_epithet?: string | null;
};

export type ParentLinkRecord = {
  id?: string | number;
  taxon_name_id?: string | number;
  parent_taxon_name_id?: string | number;
  sequence?: number | string | null;
};

export type ParentTaxonRecord = {
  id?: string | number;
  taxon_name_id?: string | number;
  scientific_name?: string | null;
  canonical_name?: string | null;
  uninomial?: string | null;
  formatted_scientific_name?: string | null;
};

type ParentPreviewOptions = {
  includeBracketedScientificContext?: boolean;
};

const nullableBlank = <T>(value: T | '' | undefined): T | null | undefined => {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  return value;
};

export const normalizeHybridMultiplicationSign = (
  value?: string | null
): string | null | undefined =>
  typeof value === 'string'
    ? value.replace(/(^|\s)x\s+/gi, '$1× ')
    : value;

export const normalizeTaxonNameHybridFields = <T extends TaxonNameHybridPayload>(data: T): T => {
  const hybridCategory = data.hybrid_category || null;
  const isHybrid = Boolean(data.is_hybrid || hybridCategory);
  const parallelUninomial = nullableBlank(data.parallel_override_uninomial);
  const parallelSpecificEpithet = nullableBlank(
    data.parallel_override_specific_epithet
  );

  return {
    ...data,
    is_hybrid: isHybrid,
    hybrid_category: isHybrid ? hybridCategory : null,
    naturalised_status: nullableBlank(data.naturalised_status),
    naturalised_certainty: nullableBlank(data.naturalised_certainty),
    parallel_override_uninomial: parallelUninomial,
    parallel_override_specific_epithet: normalizeHybridMultiplicationSign(
      parallelSpecificEpithet
    ),
    parallel_override_infraspecific_epithet: normalizeHybridMultiplicationSign(
      nullableBlank(data.parallel_override_infraspecific_epithet)
    ),
    specific_epithet: normalizeHybridMultiplicationSign(data.specific_epithet),
    infraspecific_epithet: normalizeHybridMultiplicationSign(
      data.infraspecific_epithet
    ),
  };
};

const bracketedScientificHead = (taxon?: ParentTaxonRecord | null) => {
  const candidates = [taxon?.canonical_name, taxon?.scientific_name]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const match = candidate.match(/^(\S+)\s+\(([^)]+)\)/);
    if (match) {
      return `${match[1]} (${match[2].trim()})`;
    }
  }

  return '';
};

export const formatParentPreviewName = (
  taxon?: ParentTaxonRecord | null,
  options: ParentPreviewOptions = {}
) =>
  (options.includeBracketedScientificContext
    ? bracketedScientificHead(taxon)
    : '') ||
  taxon?.uninomial?.trim() ||
  taxon?.scientific_name?.trim() ||
  taxon?.canonical_name?.trim() ||
  '';

export const getOrderedParentNames = (
  rows: ParentLinkRecord[],
  parentTaxa: Map<string, ParentTaxonRecord>,
  options: ParentPreviewOptions = {}
) =>
  [...rows]
    .sort(
      (left, right) => Number(left.sequence ?? 0) - Number(right.sequence ?? 0)
    )
    .map((row) =>
      row.parent_taxon_name_id == null
        ? ''
        : formatParentPreviewName(
            parentTaxa.get(String(row.parent_taxon_name_id)),
            options
          )
    )
    .filter(Boolean);

export const deriveParentValue = (
  rows: ParentLinkRecord[],
  parentTaxa: Map<string, ParentTaxonRecord>,
  hybridCategory?: string | null,
  options: ParentPreviewOptions = {}
) => {
  const orderedParentNames = getOrderedParentNames(rows, parentTaxa, options);

  if (hybridCategory === 'named_hybrid') {
    return orderedParentNames[0] ?? '';
  }

  if (hybridCategory === 'intergrade') {
    return orderedParentNames.join(' - ');
  }

  return orderedParentNames.join(' × ');
};
