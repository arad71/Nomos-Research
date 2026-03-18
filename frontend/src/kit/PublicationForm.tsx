import * as React from 'react';
import { maxValue, minValue, required } from 'ra-core';
import { AutocompleteArrayInput } from '@/components/admin/autocomplete-array-input';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { BooleanInput } from '@/components/admin/boolean-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceArrayInput } from '@/components/admin/reference-array-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import { validateOptionalDoi, validateOptionalHttpUrl } from './publicationDoi';

const requiredValue = required();
const minDay = minValue(1);
const maxDay = maxValue(31);
const minMonth = minValue(1);
const maxMonth = maxValue(12);
const minYear = minValue(1735);
const minZero = minValue(0);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="col-span-full pt-2">
    <h3 className="text-base font-semibold tracking-tight">{children}</h3>
  </div>
);

const PublicationForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SectionTitle>Publication</SectionTitle>
      <TextInput source="title" className="xl:col-span-2" />
      <TextInput
        source="abbreviated_title"
        label="Abbreviated title"
        validate={requiredValue}
        className="xl:col-span-2"
      />
      <TextInput
        source="author_name"
        label="Publication authors"
        className="xl:col-span-2"
      />
      <NumberInput
        source="publication_day"
        label="Day"
        min={1}
        max={31}
        validate={[minDay, maxDay]}
      />
      <NumberInput
        source="publication_month"
        label="Month"
        min={1}
        max={12}
        validate={[minMonth, maxMonth]}
      />
      <NumberInput
        source="publication_year"
        label="Year"
        min={1735}
        validate={minYear}
      />
      <BooleanInput source="published" label="Published" defaultValue={false} />
      <TextInput
        source="doi"
        label="DOI"
        className="xl:col-span-2"
        validate={validateOptionalDoi}
      />

      <SectionTitle>Publication metadata</SectionTitle>
      <ReferenceArrayInput
        source="author_ids"
        reference="authors"
        sort={{ field: 'abbreviation', order: 'ASC' }}
        perPage={100}
      >
        <AutocompleteArrayInput label="Authors" optionText="abbreviation" className="xl:col-span-2" />
      </ReferenceArrayInput>
      <TextInput source="publisher" className="xl:col-span-2" />
      <ReferenceInput
        source="parent_id"
        reference="publications"
        sort={{ field: 'abbreviated_title', order: 'ASC' }}
        perPage={100}
      >
        <AutocompleteInput label="Parent publication" optionText="abbreviated_title" className="xl:col-span-2" />
      </ReferenceInput>
      <TextInput source="published_location" label="Published location" />
      <TextInput source="volume" />
      <TextInput source="edition" />
      <TextInput source="pages" />

      <SectionTitle>Details</SectionTitle>
      <NumberInput source="legacy_id" label="Legacy ID" min={0} validate={minZero} />
      <TextInput source="isbn" label="ISBN" />
      <TextInput source="issn" label="ISSN" />
      <TextInput source="tl2" label="TL2" />
      <TextInput
        source="bhl_url"
        label="BHL URL"
        className="xl:col-span-2"
        validate={validateOptionalHttpUrl}
      />
      <TextInput source="reference_type" label="Reference type" />
      <TextInput source="reference_author_role" label="Reference author role" />
      <ReferenceInput
        source="duplicate_of_id"
        reference="publications"
        sort={{ field: 'abbreviated_title', order: 'ASC' }}
        perPage={100}
      >
        <AutocompleteInput label="Duplicate of" optionText="abbreviated_title" className="xl:col-span-2" />
      </ReferenceInput>
      <TextInput source="language" />

      <SectionTitle>Notes</SectionTitle>
      <TextInput source="notes" multiline className="xl:col-span-4" />
    </div>
  </SimpleForm>
);

export default PublicationForm;
