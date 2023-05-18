export interface HierarchyFormData {
  classification_system_id: number;
  taxon_name_id: number;
  parent_nid: number;
  path?: { path: string };
  taxon_rank_name?: string;
}
