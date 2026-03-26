import { TaxonName } from './TaxonName';

export const hierarchyRowClick = (
  id: number,
  basePath: string,
  record: TaxonName
) => `/taxon_names/${record.taxon_name_id}/show/hierarchy`;

export const hierarchyCodeRowClick = (
  id: number,
  basePath: string,
  record: TaxonName
) => `/taxon_names_code/${record.taxon_name_id}/show`;
