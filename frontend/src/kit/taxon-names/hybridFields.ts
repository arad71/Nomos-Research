import { parseCultivarEpithet } from './cultivar';

export type TaxonNameHybridPayload = {
  is_hybrid?: boolean | null;
  hybrid_category?: string | null;
  has_cultivar?: boolean | null;
  cultivar_epithet?: string | null;
  naturalised_status?: string | null;
  naturalised_certainty?: boolean | string | null;
};

const nullableBlank = <T>(value: T | '' | undefined): T | null | undefined => {
  if (value === '') {
    return null;
  }
  return value;
};

export const normalizeTaxonNameHybridFields = <T extends TaxonNameHybridPayload>(data: T): T => {
  const { has_cultivar: hasCultivar, ...rest } = data;
  const hybridCategory = data.hybrid_category || null;
  const isHybrid = Boolean(data.is_hybrid || hybridCategory);

  return {
    ...rest,
    is_hybrid: isHybrid,
    hybrid_category: isHybrid ? hybridCategory : null,
    cultivar_epithet:
      hasCultivar === false ? null : parseCultivarEpithet(data.cultivar_epithet),
    naturalised_status: nullableBlank(data.naturalised_status),
    naturalised_certainty: nullableBlank(data.naturalised_certainty),
  } as T;
};
