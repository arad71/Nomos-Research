import * as React from 'react';
import { required } from 'ra-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SimpleForm } from '@/components/admin/simple-form';

const requiredValue = required();

type TaxonNameParentFormValues = {
  taxon_name_id?: number | string;
  parent_taxon_name_id?: number | string;
  sequence?: number | string;
};

type TaxonNameParentFormFieldsProps = {
  hideTaxonName?: boolean;
};

const TaxonNameParentFormFields = ({ hideTaxonName = false }: TaxonNameParentFormFieldsProps) => {
  const { setValue } = useFormContext<TaxonNameParentFormValues>();
  const taxonNameId = useWatch({ name: 'taxon_name_id' });

  React.useEffect(() => {
    if (!taxonNameId) {
      setValue('parent_taxon_name_id', '', { shouldDirty: true });
    }
  }, [taxonNameId, setValue]);

  const parentFilter = React.useMemo(() => {
    const filter: Record<string, unknown> = {
      scientific_name__gt: '',
      deleted: false,
    };

    if (taxonNameId) {
      filter.taxon_name_id__ne = taxonNameId;
    }

    return filter;
  }, [taxonNameId]);

  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
      {!hideTaxonName ? (
        <ReferenceInput
          source="taxon_name_id"
          reference="taxon_names"
          sort={{ field: 'canonical_name', order: 'ASC' }}
          perPage={1000}
        >
          <AutocompleteInput
            label="Taxon name"
            optionText="scientific_name"
            validate={requiredValue}
            filterToQuery={(searchText: string) => ({
              scientific_name__ilike: `%${searchText}%`,
            })}
            helperText="Specify the child taxon name that these parent rows belong to."
          />
        </ReferenceInput>
      ) : null}

      <ReferenceInput
        source="parent_taxon_name_id"
        reference="taxon_names"
        sort={{ field: 'canonical_name', order: 'ASC' }}
        perPage={1000}
        filter={parentFilter}
      >
        <AutocompleteInput
          label="Parent name"
          optionText="scientific_name"
          validate={requiredValue}
          filterToQuery={(searchText: string) => ({
            scientific_name__ilike: `%${searchText}%`,
          })}
          helperText="Select an existing taxon name to act as a parent. The current taxon name is excluded."
        />
      </ReferenceInput>

      <NumberInput
        source="sequence"
        label="Sequence"
        validate={requiredValue}
        helperText="Controls the ordering of parent names when generating the derived uninomial."
      />
    </div>
  );
};

type TaxonNameParentFormProps = {
  hideTaxonName?: boolean;
};

const TaxonNameParentForm = ({ hideTaxonName = false }: TaxonNameParentFormProps) => (
  <div
    onClick={(event) => event.stopPropagation()}
    onDoubleClick={(event) => event.stopPropagation()}
  >
    <SimpleForm className="max-w-none">
      <TaxonNameParentFormFields hideTaxonName={hideTaxonName} />
    </SimpleForm>
  </div>
);

export default TaxonNameParentForm;
