import { maxValue, minValue, required, useRecordContext } from 'ra-core';
import { AutocompleteArrayInput } from '@/components/admin/autocomplete-array-input';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { BooleanInput } from '@/components/admin/boolean-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceArrayInput } from '@/components/admin/reference-array-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import PublicationTaxonPublicationsSection from './PublicationTaxonPublicationsSection';
import { formatAuthorOption } from '../authors/authorDisplay';
import { validateOptionalDoi, validateOptionalHttpUrl } from '../shared/publicationDoi';

const requiredValue = required();
const minDay = minValue(1);
const maxDay = maxValue(31);
const minMonth = minValue(1);
const maxMonth = maxValue(12);
const minYear = minValue(1735);
const minZero = minValue(0);

const PublicationForm = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <SimpleForm className="max-w-none">
      <div className="grid gap-8">
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">Publication</h3>
          </div>
          <div className="grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              className="xl:col-span-4"
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
              className="xl:col-span-4"
              validate={validateOptionalDoi}
            />
          </div>
        </section>

      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Publication metadata</h3>
        </div>
        <div className="grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReferenceArrayInput
            source="author_ids"
            reference="authors"
            sort={{ field: 'abbreviation', order: 'ASC' }}
            perPage={1000}
          >
            <AutocompleteArrayInput label="Authors" optionText={formatAuthorOption} className="xl:col-span-4" />
          </ReferenceArrayInput>
          <TextInput source="publisher" className="xl:col-span-4" />
          <ReferenceInput
            source="parent_id"
            reference="publications"
            sort={{ field: 'abbreviated_title', order: 'ASC' }}
            perPage={1000}
          >
            <AutocompleteInput
              label="Parent publication"
              optionText="abbreviated_title"
              className="xl:col-span-4"
            />
          </ReferenceInput>
          <TextInput source="published_location" label="Published location" className="xl:col-span-4" />
          <TextInput source="volume" />
          <TextInput source="edition" />
          <TextInput source="pages" />
        </div>
      </section>

      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Details</h3>
        </div>
        <div className="grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NumberInput source="legacy_id" label="Legacy ID" min={0} validate={minZero} />
          <TextInput source="isbn" label="ISBN" />
          <TextInput source="issn" label="ISSN" />
          <TextInput source="tl2" label="TL2" />
          <TextInput
            source="bhl_url"
            label="BHL URL"
            className="xl:col-span-4"
            validate={validateOptionalHttpUrl}
          />
          <TextInput source="reference_type" label="Reference type" />
          <TextInput source="reference_author_role" label="Reference author role" />
          <ReferenceInput
            source="duplicate_of_id"
            reference="publications"
            sort={{ field: 'abbreviated_title', order: 'ASC' }}
            perPage={1000}
          >
            <AutocompleteInput label="Duplicate of" optionText="abbreviated_title" className="xl:col-span-4" />
          </ReferenceInput>
          <TextInput source="language" />
        </div>
      </section>

        <section className="mt-12 space-y-4 border-t border-border pt-12">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">Notes</h3>
          </div>
          <div className="grid max-w-6xl gap-4">
            <TextInput source="notes" multiline className="xl:col-span-4" />
          </div>
        </section>

        <PublicationTaxonPublicationsSection
          editable
          key={String(record?.id ?? 'publication-create')}
        />
      </div>
    </SimpleForm>
  );
};

export default PublicationForm;
