import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { maxValue, minValue, number, required } from 'ra-core';
import { AutocompleteArrayInput } from '@/components/admin/autocomplete-array-input';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { BooleanInput } from '@/components/admin/boolean-input';
import { DateInput } from '@/components/admin/date-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceArrayInput } from '@/components/admin/reference-array-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import { parseDateOnlyToDateTime } from '../shared/dateOnlyDateTime';
import NaturalisedStatus from '../shared/choices/NaturalisedStatus';
import PublicationStatus from '../shared/choices/PublicationStatus';

const requiredValue = required();
const minYear = minValue(1735);
const minOne = minValue(1);
const maxDay = maxValue(31);
const maxMonth = maxValue(12);
const EMPTY_CHOICE = '__empty__';

type TaxonNameFormValues = {
  review?: boolean;
  review_reason?: string | null;
  specific_epithet?: string | null;
  infraspecific_epithet?: string | null;
  is_autonym?: boolean;
};

const validateReviewReason = (value?: string | null, allValues?: TaxonNameFormValues) => {
  if (allValues?.review && !value?.trim()) {
    return 'A reason must be specified if you flag this taxon for review';
  }

  return undefined;
};

const validateInfraspecificEpithet = (value?: string | null, allValues?: TaxonNameFormValues) => {
  if (
    allValues?.is_autonym &&
    value &&
    allValues.specific_epithet &&
    value !== allValues.specific_epithet
  ) {
    return 'Infraspecific epithet must match the specific epithet when autonym is true';
  }

  return undefined;
};

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

const TaxonNameFormInner = ({
  topContent,
  relatedSections,
}: {
  topContent?: React.ReactNode;
  relatedSections?: React.ReactNode;
}) => {
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

  React.useEffect(() => {
    if (!infraspecificEpithet) {
      setValue('is_autonym', false, { shouldDirty: true, shouldValidate: true });
    }
  }, [infraspecificEpithet, setValue]);

  return (
    <div className="grid gap-8">
      {topContent}

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
          {review ? (
            <TextInput
              source="review_reason"
              label="Review reason"
              className="xl:col-span-2"
              validate={validateReviewReason}
            />
          ) : null}

          <div className="hidden md:block md:col-span-2 xl:col-span-4" aria-hidden="true" />
          <TextInput source="uninomial" validate={requiredValue} />
          <TextInput source="specific_epithet" />
          <TextInput source="infraspecific_epithet" validate={validateInfraspecificEpithet} />
          {infraspecificEpithet ? <BooleanInput source="is_autonym" label="Autonym" /> : null}

          <div className="hidden md:block md:col-span-2 xl:col-span-4" aria-hidden="true" />
          <NumberInput
            source="form_desc_dy"
            label="Day"
            min={1}
            max={31}
            validate={[number(), minOne, maxDay]}
          />
          <NumberInput
            source="form_desc_mn"
            label="Month"
            min={1}
            max={12}
            validate={[number(), minOne, maxMonth]}
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
          <BooleanInput source="is_wa_recognised" label="WA recognised" />

          <div className="hidden md:block md:col-span-2 xl:col-span-4" aria-hidden="true" />
          <TextInput source="legacy_id" label="Legacy ID" className="xl:col-span-4" />
        </div>
      </section>

      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Authority</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextInput source="authorised_by" label="Authorised by" className="xl:col-span-2" />
          <DateInput source="authorised_on" label="Authorised on" parse={parseDateOnlyToDateTime} className="xl:col-span-2" />
          <TextInput source="contributed_by" label="Contributed by" className="xl:col-span-2" />
          <DateInput source="contributed_on" label="Contributed on" parse={parseDateOnlyToDateTime} className="xl:col-span-2" />
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

const TaxonNameForm = ({
  topContent,
  relatedSections,
}: {
  topContent?: React.ReactNode;
  relatedSections?: React.ReactNode;
}) => (
  <SimpleForm className="max-w-none">
    <TaxonNameFormInner topContent={topContent} relatedSections={relatedSections} />
  </SimpleForm>
);

export default TaxonNameForm;
