import { TaxonName } from './TaxonName';

export const hierarchyRowClick = (
  id: number,
  basePath: string,
  record: TaxonName
) => `/taxon_names/${record.taxon_name_id}/show/hierarchy`;
