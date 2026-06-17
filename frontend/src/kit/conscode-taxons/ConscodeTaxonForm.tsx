import * as React from 'react';
import { maxValue, required } from 'ra-core';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { DateInput } from '@/components/admin/date-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';

const requiredValue = required();
const validateDate = [requiredValue, maxValue(new Date('2024-04-17'))];

const conservationCodeOptionText = (choice?: {
  authorising_org?: string;
  conservation_code_value?: string;
}) => {
  if (!choice) return '';
  const authority = choice.authorising_org ?? '';
  const value = choice.conservation_code_value ?? '';
  return authority && value ? `${authority}: ${value}` : value || authority;
};

const ConscodeTaxonForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-5xl gap-4">
      <ReferenceInput
        source="taxon_name_id"
        reference="taxon_names"
        sort={{ field: 'canonical_name', order: 'ASC' }}
        perPage={200}
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

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <ReferenceInput
          source="conservation_code_id"
          reference="conservation_codes"
          label="Conservation code"
          sort={{ field: 'code_priority', order: 'ASC' }}
        >
          <SelectInput optionText={conservationCodeOptionText} validate={requiredValue} />
        </ReferenceInput>
        <DateInput source="effective_from" label="Effective from" validate={validateDate} />
        <DateInput source="effective_to" label="Effective to" />
      </div>

      <TextInput source="notes" label="Notes" multiline />
    </div>
  </SimpleForm>
);

export default ConscodeTaxonForm;
