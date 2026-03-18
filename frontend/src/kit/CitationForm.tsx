import * as React from 'react';
import { minValue, required } from 'ra-core';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import AuthorType from '../admin/Citations/AuthorType';

const requiredValue = required();
const minZero = minValue(0);

type CitationFormProps = {
  hideTaxonName?: boolean;
};

const CitationForm = ({ hideTaxonName = false }: CitationFormProps) => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
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
          />
        </ReferenceInput>
      ) : null}
      <ReferenceInput
        source="author_id"
        reference="authors"
        sort={{ field: 'abbreviation', order: 'ASC' }}
        perPage={100}
      >
        <AutocompleteInput
          label="Author"
          optionText="abbreviation"
          validate={requiredValue}
        />
      </ReferenceInput>
      <SelectInput source="author_type" label="Author type" choices={AuthorType} />
      <NumberInput
        source="author_order"
        label="Author order"
        min={0}
        validate={[requiredValue, minZero]}
      />
    </div>
  </SimpleForm>
);

export default CitationForm;
