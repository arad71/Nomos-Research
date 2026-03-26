import * as React from 'react';
import { required } from 'ra-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import TaxonRank from '../../admin/Taxon_names/TaxonRank';

const requiredValue = required();

type HierarchyFormValues = {
  classification_system_id?: number | string;
  taxon_name_id?: number | string;
  parent_nid?: number | string;
  taxon_rank_name?: string;
};

type HierarchyFormFieldsProps = {
  hideTaxonName?: boolean;
};

const HierarchyFormFields = ({ hideTaxonName = false }: HierarchyFormFieldsProps) => {
  const { setValue } = useFormContext<HierarchyFormValues>();
  const classificationSystemId = useWatch({ name: 'classification_system_id' });
  const taxonNameId = useWatch({ name: 'taxon_name_id' });
  const taxonRankName = useWatch({ name: 'taxon_rank_name' });
  const dependencyKey = `${classificationSystemId ?? ''}:${taxonNameId ?? ''}:${taxonRankName ?? ''}`;
  const previousDependencyKey = React.useRef(dependencyKey);

  React.useEffect(() => {
    if (previousDependencyKey.current !== dependencyKey) {
      setValue('parent_nid', '', { shouldDirty: true });
      previousDependencyKey.current = dependencyKey;
    }
  }, [dependencyKey, setValue]);

  const parentEnabled = Boolean(classificationSystemId) && Boolean(taxonNameId);
  const parentFilter = React.useMemo(() => {
    const filter: Record<string, unknown> = {
      taxon_name___scientific_name__gt: '',
    };

    if (!parentEnabled) {
      return filter;
    }

    filter.taxon_name_id__ne = taxonNameId;
    filter.taxon_name___deleted = false;
    filter.classification_system_id = classificationSystemId;
    filter.path__ltxtquery = `!${taxonNameId}`;

    if (taxonRankName) {
      filter.taxon_name___taxon_rank___rank_name = taxonRankName;
    }

    return filter;
  }, [classificationSystemId, parentEnabled, taxonNameId, taxonRankName]);

  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
      <ReferenceInput
        source="classification_system_id"
        reference="classification_systems"
        filter={{ class_type: 'hierarchical' }}
        sort={{ field: 'class_desc', order: 'ASC' }}
      >
        <SelectInput
          label="Classification system"
          optionText="class_desc"
          validate={requiredValue}
          helperText="Choose a classification system. If you change classification system, ensure you change the parent name."
        />
      </ReferenceInput>

      {!hideTaxonName ? (
        <ReferenceInput
          source="taxon_name_id"
          reference="taxon_names"
          sort={{ field: 'canonical_name', order: 'ASC' }}
          perPage={100}
          filterToQuery={(searchText: string) => ({
            scientific_name__ilike: `%${searchText}%`,
          })}
        >
          <AutocompleteInput
            label="Taxon name"
            optionText="scientific_name"
            validate={requiredValue}
            helperText="Specify the name you are dealing with."
          />
        </ReferenceInput>
      ) : null}

      <SelectInput
        source="taxon_rank_name"
        label="Filter parent rank"
        choices={TaxonRank}
        emptyText=""
        helperText="You may filter the parent names by taxonomic rank."
      />

      <ReferenceInput
        source="parent_nid"
        reference="hierarchies/parents"
        filter={parentFilter}
        sort={{
          field: 'taxon_name___canonical_name,taxon_name___author',
          order: 'ASC,ASC',
        }}
        perPage={25}
      >
        <AutocompleteInput
          label="Parent name"
          optionText="scientific_name"
          disabled={!parentEnabled}
          validate={parentEnabled ? requiredValue : undefined}
          helperText="Please select a name that will act as a parent of this name. Requires classification system and taxon name to be set."
        />
      </ReferenceInput>
    </div>
  );
};

type HierarchyFormProps = {
  hideTaxonName?: boolean;
};

const HierarchyForm = ({ hideTaxonName = false }: HierarchyFormProps) => (
  <SimpleForm className="max-w-none">
    <HierarchyFormFields hideTaxonName={hideTaxonName} />
  </SimpleForm>
);

export default HierarchyForm;
