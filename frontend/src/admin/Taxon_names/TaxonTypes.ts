export type InfragenericData = {
  id: number;
  name_version: string;
  formatted_name: string;
  author: string;
  formatted_name_with_author: string;
  contributing_taxon_names: [string];
  contributing_taxon_name_ids: [number];
  info?: string;
  searched_taxon_id: number;
};

export interface InfragenericNamesData extends Record<any, any> {
  id: number;
  infrageneric_names: Array<InfragenericData>;
}
