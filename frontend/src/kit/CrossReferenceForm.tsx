import * as React from 'react';
import { required } from 'ra-core';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import CrossRefType from '../admin/Cross_references/CrossRefType';

const requiredValue = required();

const taxonNameFilterToQuery = (searchText: string) => ({
  scientific_name__ilike: `%${searchText}%`,
});

type CrossReferenceFormProps = {
  hideOldName?: boolean;
  hideNewName?: boolean;
};

const CrossReferenceForm = ({
  hideOldName = false,
  hideNewName = false,
}: CrossReferenceFormProps) => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3">
      {!hideOldName ? (
        <ReferenceInput
          source="old_name_id"
          reference="taxon_names"
          sort={{ field: 'canonical_name', order: 'ASC' }}
          perPage={100}
          filterToQuery={taxonNameFilterToQuery}
        >
          <AutocompleteInput
            label="Old name"
            optionText="scientific_name"
            validate={requiredValue}
          />
        </ReferenceInput>
      ) : null}
      {!hideNewName ? (
        <ReferenceInput
          source="new_name_id"
          reference="taxon_names"
          sort={{ field: 'canonical_name', order: 'ASC' }}
          perPage={100}
          filterToQuery={taxonNameFilterToQuery}
        >
          <AutocompleteInput label="New name" optionText="scientific_name" />
        </ReferenceInput>
      ) : null}
      <SelectInput
        source="cross_reference_type"
        label="Cross reference type"
        choices={CrossRefType}
        validate={requiredValue}
        className="md:col-span-2 xl:col-span-3"
      />
      <TextInput source="authorised_by" label="Authorised by" />
      <div className="grid gap-4 md:col-span-2 md:grid-cols-3 xl:col-span-2">
        <NumberInput source="authorised_yr" label="Authorised year" />
        <NumberInput source="authorised_mn" label="Authorised month" min={1} max={12} />
        <NumberInput source="authorised_dy" label="Authorised day" min={1} max={31} />
      </div>
      <TextInput
        source="reference_comments"
        label="Comments"
        multiline
        className="md:col-span-2 xl:col-span-3"
      />
      <TextInput source="notes" label="Notes" multiline className="xl:col-span-3" />
    </div>
  </SimpleForm>
);

export default CrossReferenceForm;
