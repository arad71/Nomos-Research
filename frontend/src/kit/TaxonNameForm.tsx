import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { minValue, number, required } from 'ra-core';
import { AutocompleteArrayInput } from '@/components/admin/autocomplete-array-input';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { BooleanInput } from '@/components/admin/boolean-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceArrayInput } from '@/components/admin/reference-array-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import NaturalisedStatus from '../admin/Taxon_names/NaturalisedStatus';
import PublicationStatus from '../admin/Taxon_names/PublicationStatus';

const requiredValue = required();
const minYear = minValue(1735);
const minOne = minValue(1);
const EMPTY_CHOICE = '__empty__';

const nullableBooleanChoices = [
  { id: EMPTY_CHOICE, name: '' },
  { id: 'true', name: 'Yes' },
  { id: 'false', name: 'No' },
];

const parseNullableBoolean = (value: string) => {
  if (value === EMPTY_CHOICE) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const formatNullableBoolean = (value: boolean | null | undefined) => {
  if (value === null || value === undefined) return EMPTY_CHOICE;
  return value ? 'true' : 'false';
};

const classificationSystemFilterToQuery = (searchText: string) => ({
  class_desc__ilike: `%${searchText}%`,
});

const formatRankOption = (choice?: {
  id?: string | number;
  taxon_rank_id?: string | number;
  rank_name?: string;
  kingdom_name?: string;
  kingdom_id?: string | number;
}) => {
  if (!choice?.rank_name) {
    return '';
  }

  const kingdomLabel =
    choice.kingdom_name ??
    (choice.kingdom_id != null ? `kingdom ${choice.kingdom_id}` : undefined);

  if (kingdomLabel) {
    return `${choice.rank_name} (${kingdomLabel})`;
  }
  return choice.rank_name;
};

const TaxonNameFormInner = ({ relatedSections }: { relatedSections?: React.ReactNode }) => {
  const { setValue } = useFormContext();
  const kingdomId = useWatch({ name: 'kingdom_id' });
  const review = useWatch({ name: 'review' });
  const infraspecificEpithet = useWatch({ name: 'infraspecific_epithet' });

  const previousKingdomId = React.useRef<number | string | undefined>(kingdomId);

  React.useEffect(() => {
    if (previousKingdomId.current !== undefined && previousKingdomId.current !== kingdomId) {
      setValue('rank_id', undefined, { shouldDirty: true, shouldValidate: true });
    }
    previousKingdomId.current = kingdomId;
  }, [kingdomId, setValue]);

  React.useEffect(() => {
    if (!review) {
      setValue('review_reason', '', { shouldDirty: true, shouldValidate: true });
    }
  }, [review, setValue]);

  return (
    <div className="grid gap-8">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Name</h3>
          <p className="text-sm text-muted-foreground">Core taxonomic naming and publication fields.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReferenceInput source="kingdom_id" reference="kingdoms" sort={{ field: 'kingdom_name', order: 'ASC' }}>
            <SelectInput optionText="kingdom_name" validate={requiredValue} />
          </ReferenceInput>
          <ReferenceInput
            source="rank_id"
            reference="taxon_ranks"
            sort={{ field: 'rank_name', order: 'ASC' }}
            filter={kingdomId ? { kingdom_id: kingdomId } : undefined}
            perPage={100}
          >
            <AutocompleteInput
              optionText={formatRankOption}
              validate={requiredValue}
              disabled={!kingdomId}
            />
          </ReferenceInput>
          <BooleanInput source="review" label="Review?" />
          {review ? <TextInput source="review_reason" label="Review reason" className="xl:col-span-2" /> : null}

          <div className="hidden md:block md:col-span-2 xl:col-span-4" aria-hidden="true" />
          <TextInput source="uninomial" validate={requiredValue} />
          <TextInput source="specific_epithet" />
          <TextInput source="infraspecific_epithet" />
          {infraspecificEpithet ? <BooleanInput source="is_autonym" label="Autonym" /> : null}

          <div className="hidden md:block md:col-span-2 xl:col-span-4" aria-hidden="true" />
          <NumberInput
            source="form_desc_dy"
            label="Day"
            min={1}
            max={31}
            validate={[number(), minOne]}
          />
          <NumberInput
            source="form_desc_mn"
            label="Month"
            min={1}
            max={12}
            validate={[number(), minOne]}
          />
          <NumberInput
            source="form_desc_yr"
            label="Year"
            min={1735}
            validate={[number(), minYear]}
          />

          <div className="hidden md:block md:col-span-2 xl:col-span-4" aria-hidden="true" />
          <SelectInput source="publication_status" choices={PublicationStatus} />
          <BooleanInput source="is_current" label="Current" />
          <BooleanInput source="validated" label="Validated" />

          <div className="hidden md:block md:col-span-2 xl:col-span-4" aria-hidden="true" />
          <TextInput source="legacy_id" label="Legacy ID" className="xl:col-span-4" />
        </div>
      </section>

      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Details</h3>
          <p className="text-sm text-muted-foreground">Status, informal groups, and supporting detail.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectInput source="naturalised_status" choices={NaturalisedStatus} label="Naturalised status" />
          <SelectInput
            source="naturalised_certainty"
            label="Naturalised certainty"
            choices={nullableBooleanChoices}
            parse={parseNullableBoolean}
            format={formatNullableBoolean}
          />
          <TextInput source="naturalised_comments" label="Naturalised comments" multiline className="xl:col-span-4" />
          <div className="xl:col-span-4">
            <ReferenceArrayInput
              source="classification_system_ids"
              reference="classification_systems"
              filter={{ class_type: ['informal'] }}
            >
              <AutocompleteArrayInput
                label="Informal groups"
                optionText="class_desc"
                filterToQuery={classificationSystemFilterToQuery}
              />
            </ReferenceArrayInput>
          </div>
        </div>
      </section>

      {relatedSections}

      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Notes</h3>
        </div>
        <div className="grid gap-4">
          <TextInput source="comments" label="Comments" multiline />
        </div>
      </section>
    </div>
  );
};

const TaxonNameForm = ({ relatedSections }: { relatedSections?: React.ReactNode }) => (
  <SimpleForm className="max-w-none">
    <TaxonNameFormInner relatedSections={relatedSections} />
  </SimpleForm>
);

export default TaxonNameForm;
