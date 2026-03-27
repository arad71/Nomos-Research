import * as React from 'react';
import { minValue, required } from 'ra-core';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { BooleanInput } from '@/components/admin/boolean-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import LanguageType from '../shared/choices/LanguageType';

const requiredValue = required();
const minZero = minValue(0);

type VernacularFormProps = {
  hideTaxonName?: boolean;
};

const VernacularForm = ({ hideTaxonName = false }: VernacularFormProps) => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
      <TextInput source="vernacular_name" label="Vernacular" validate={requiredValue} />
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
      <TextInput source="source" label="Source" className="md:col-span-2" />
      <SelectInput source="language" choices={LanguageType} validate={requiredValue} />
      <BooleanInput source="lang_pref" label="Lang pref" defaultValue={false} />
      <NumberInput source="sort_order" label="Sort order" min={0} validate={minZero} />
      <BooleanInput source="preferred" label="Preferred" defaultValue={false} />
    </div>
  </SimpleForm>
);

export default VernacularForm;
