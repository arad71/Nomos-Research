export type TaxonNameHybridPayload = {
  is_hybrid?: boolean | null;
  hybrid_category?: string | null;
  naturalised_status?: string | null;
  naturalised_certainty?: boolean | string | null;
  parallel_override_uninomial?: string | null;
  parallel_override_specific_epithet?: string | null;
  parallel_override_infraspecific_epithet?: string | null;
};

const nullableBlank = <T>(value: T | '' | undefined): T | null | undefined => {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  return value;
};

export const normalizeTaxonNameHybridFields = <T extends TaxonNameHybridPayload>(data: T): T => {
  const hybridCategory = data.hybrid_category || null;
  const isHybrid = Boolean(data.is_hybrid || hybridCategory);

  return {
    ...data,
    is_hybrid: isHybrid,
    hybrid_category: isHybrid ? hybridCategory : null,
    naturalised_status: nullableBlank(data.naturalised_status),
    naturalised_certainty: nullableBlank(data.naturalised_certainty),
    parallel_override_uninomial: nullableBlank(data.parallel_override_uninomial),
    parallel_override_specific_epithet: nullableBlank(
      data.parallel_override_specific_epithet
    ),
    parallel_override_infraspecific_epithet: nullableBlank(
      data.parallel_override_infraspecific_epithet
    ),
  };
};
