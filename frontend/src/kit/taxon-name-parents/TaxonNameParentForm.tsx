import * as React from 'react';
import { required } from 'ra-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SimpleForm } from '@/components/admin/simple-form';

const requiredValue = required();
const MIN_PARENT_SEARCH_LENGTH = 2;
const PARENT_SEARCH_PAGE_SIZE = 50;

const hasTaxonNameSearch = (filters: Record<string, unknown>) =>
  typeof filters.scientific_name__ilike === 'string' &&
  filters.scientific_name__ilike.replace(/%/g, '').trim().length >= MIN_PARENT_SEARCH_LENGTH;

const taxonNameSearchFilter = (searchText: string) => {
  const trimmedSearch = searchText.trim();
  if (trimmedSearch.length < MIN_PARENT_SEARCH_LENGTH) {
    return {};
  }

  return {
    scientific_name__ilike: `%${trimmedSearch}%`,
  };
};

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
          perPage={PARENT_SEARCH_PAGE_SIZE}
          enableGetChoices={hasTaxonNameSearch}
        >
          <AutocompleteInput
            label="Taxon name"
            optionText="scientific_name"
            validate={requiredValue}
            filterToQuery={taxonNameSearchFilter}
            helperText="Type at least 2 characters to search for the child taxon name."
          />
        </ReferenceInput>
      ) : null}

      <ReferenceInput
        source="parent_taxon_name_id"
        reference="taxon_names"
        sort={{ field: 'canonical_name', order: 'ASC' }}
        perPage={PARENT_SEARCH_PAGE_SIZE}
        filter={parentFilter}
        enableGetChoices={hasTaxonNameSearch}
      >
        <AutocompleteInput
          label="Parent name"
          optionText="scientific_name"
          validate={requiredValue}
          filterToQuery={taxonNameSearchFilter}
          helperText="Type at least 2 characters to search. The current taxon name is excluded."
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
