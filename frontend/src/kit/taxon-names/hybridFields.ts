export type TaxonNameHybridPayload = {
  is_hybrid?: boolean | null;
  hybrid_category?: string | null;
};

export const normalizeTaxonNameHybridFields = <T extends TaxonNameHybridPayload>(data: T): T => {
  const hybridCategory = data.hybrid_category || null;
  const isHybrid = Boolean(data.is_hybrid || hybridCategory);

  return {
    ...data,
    is_hybrid: isHybrid,
    hybrid_category: isHybrid ? hybridCategory : null,
  };
};
