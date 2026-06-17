import * as React from 'react';
import { required } from 'ra-core';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';

const requiredValue = required();

const InformalGroupForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
      <ReferenceInput
        source="classification_system_id"
        reference="classification_systems"
        sort={{ field: 'class_desc', order: 'ASC' }}
      >
        <SelectInput optionText="class_desc" validate={requiredValue} />
      </ReferenceInput>
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
          optionText="scientific_name"
          label="Taxon name"
          validate={requiredValue}
        />
      </ReferenceInput>
    </div>
  </SimpleForm>
);

export default InformalGroupForm;
