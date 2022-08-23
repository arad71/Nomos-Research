export interface HierarchyFilterType {
  taxon_name___taxon_rank___rank_name?: string;
  taxon_name_id__ne?: number;
  taxon_name___scientific_name__gt?: string;
  taxon_name___scientific_name__ilike?: string;
  classification_system_id?: number;
  path__lquery?: string;
  path__ltxtquery?: string;
}
