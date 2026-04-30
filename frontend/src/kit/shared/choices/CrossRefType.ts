const CrossRefType = [
  { id: 'orthographic_variant', name: 'Orthographic variant' },
  { id: 'excluded_name', name: 'Excluded name' },
  { id: 'misapplied_name', name: 'Misapplied name' },
  {
    id: 'subjective_synonym',
    name: 'Taxonomic synonym',
    exportValue: 'taxonomic_synonym',
  },
  {
    id: 'objective_synonym',
    name: 'Nomenclatural synonym',
    exportValue: 'nomenclatural_synonym',
  },
  { id: 'concept_change', name: 'Concept change' },
  { id: 'formal_description', name: 'Formal description' },
  { id: 'name_entered_in_error', name: 'Name entered in error' },
  {
    id: 'isonym',
    name: 'Informal synonym',
    exportValue: 'informal_synonym',
  },
];

export const crossRefTypeMap = CrossRefType.reduce<Record<string, string>>(
  (acc, item) => {
    acc[item.id] = item.name;
    return acc;
  },
  {}
);

const crossRefTypeExportMap = CrossRefType.reduce<Record<string, string>>(
  (acc, item) => {
    acc[item.id] = item.exportValue ?? item.id;
    return acc;
  },
  {}
);

export const getCrossRefTypeLabel = (value?: string | null) =>
  value ? crossRefTypeMap[value] ?? value : '';

export const getCrossRefTypeExportValue = (value?: string | null) =>
  value ? crossRefTypeExportMap[value] ?? value : '';

export default CrossRefType;
