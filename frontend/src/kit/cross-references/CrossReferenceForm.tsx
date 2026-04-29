import * as React from 'react';
import { required } from 'ra-core';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { DateInput } from '@/components/admin/date-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import CrossRefType from '../shared/choices/CrossRefType';
import { parseDateOnlyToDateTime } from '../shared/dateOnlyDateTime';

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
    <div className="grid gap-8">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Related name</h3>
        </div>
        <div className="grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3">
          {!hideOldName ? (
            <ReferenceInput
              source="old_name_id"
              reference="taxon_names"
              sort={{ field: 'canonical_name', order: 'ASC' }}
              perPage={1000}
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
              perPage={1000}
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
        </div>
      </section>

      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Authority</h3>
        </div>
        <div className="grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextInput source="authorised_by" label="Authorised by" className="xl:col-span-2" />
          <DateInput source="authorised_on" label="Authorised on" parse={parseDateOnlyToDateTime} className="xl:col-span-2" />
          <TextInput source="contributed_by" label="Contributed by" className="xl:col-span-2" />
          <DateInput source="contributed_on" label="Contributed on" parse={parseDateOnlyToDateTime} className="xl:col-span-2" />
        </div>
      </section>

      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Notes</h3>
        </div>
        <div className="grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextInput source="internal_comments" label="Internal comments" multiline className="xl:col-span-3" />
          <TextInput source="external_comments" label="External comments" multiline className="xl:col-span-3" />
        </div>
      </section>

      <section className="mt-12 space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextInput
            source="reference_comments"
            label="Reference comments"
            multiline
            className="md:col-span-2 xl:col-span-3"
          />
          <TextInput source="notes" label="Notes" multiline className="xl:col-span-3" />
        </div>
      </section>
    </div>
  </SimpleForm>
);

export default CrossReferenceForm;
