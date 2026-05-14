import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { maxValue, minValue, number, required, useRecordContext } from 'ra-core';
import { useGetList, useGetOne } from 'react-admin';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { parseDateOnlyToDateTime } from '../shared/dateOnlyDateTime';
import NaturalisedStatus from '../shared/choices/NaturalisedStatus';
import PublicationStatus from '../shared/choices/PublicationStatus';

const requiredValue = required();
const minYear = minValue(1735);
const minOne = minValue(1);
const maxDay = maxValue(31);
const maxMonth = maxValue(12);

type TaxonNameFormValues = {
  kingdom_id?: string | number | null;
  rank_id?: string | number | null;
  taxon_rank_id?: string | number | null;
  publication_status?: string | null;
  is_current?: boolean;
  validated?: boolean;
  authorised_by?: string | null;
  authorised_on?: string | Date | null;
  contributed_by?: string | null;
  contributed_on?: string | Date | null;
  naturalised_status?: string | null;
  classification_system_ids?: Array<string | number> | null;
  parallel_override_specific_epithet?: string | null;
  parallel_override_infraspecific_epithet?: string | null;
  review?: boolean;
  review_reason?: string | null;
  specific_epithet?: string | null;
  infraspecific_epithet?: string | null;
  is_autonym?: boolean;
};

type ValidationRequirement = {
  key: string;
  label: string;
  met: boolean;
  pending?: boolean;
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
  { id: 'true', name: 'Yes' },
  { id: 'false', name: 'No' },
];

const parseNullableBoolean = (value: string) => {
  if (value === '') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const formatNullableBoolean = (value: boolean | null | undefined) => {
  if (value === null || value === undefined) return '';
  return value ? 'true' : 'false';
};

const hasValue = (value: unknown) =>
  value !== null && value !== undefined && String(value).trim() !== '';

const hasValidDate = (value: unknown) => {
  if (!hasValue(value)) {
    return false;
  }

  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  return !Number.isNaN(Date.parse(String(value)));
};

const getMissingValidationRequirements = (requirements: ValidationRequirement[]) =>
  requirements
    .filter((requirement) => !requirement.met)
    .map((requirement) => requirement.label);

const FAMILY_AND_BELOW_RANKS = new Set([
  'family',
  'subfamily',
  'tribe',
  'subtribe',
  'genus',
  'subgenus',
  'section',
  'subsection',
  'species',
  'subspecies',
  'variety',
  'subvariety',
  'form',
  'subform',
]);

const SPECIES_RANKS = new Set(['species']);
const INFRASPECIFIC_RANKS = new Set([
  'subspecies',
  'variety',
  'subvariety',
  'form',
  'subform',
]);

const ValidatedInput = () => {
  const record = useRecordContext<{ id?: string | number }>();
  const recordId = record?.id;
  const kingdomId = useWatch({ name: 'kingdom_id' });
  const rankId = useWatch({ name: 'rank_id' });
  const taxonRankId = useWatch({ name: 'taxon_rank_id' });
  const publicationStatus = useWatch({ name: 'publication_status' });
  const isCurrent = useWatch({ name: 'is_current' });
  const contributedBy = useWatch({ name: 'contributed_by' });
  const contributedOn = useWatch({ name: 'contributed_on' });
  const authorisedBy = useWatch({ name: 'authorised_by' });
  const authorisedOn = useWatch({ name: 'authorised_on' });
  const naturalisedStatus = useWatch({ name: 'naturalised_status' });
  const classificationSystemIds = useWatch({ name: 'classification_system_ids' });
  const parallelSpecificEpithet = useWatch({ name: 'parallel_override_specific_epithet' });
  const parallelInfraspecificEpithet = useWatch({ name: 'parallel_override_infraspecific_epithet' });
  const resolvedRankId = rankId ?? taxonRankId;

  const {
    data: rankRecord,
    isPending: rankPending,
  } = useGetOne<{ id?: string | number; rank_name?: string | null }>(
    'taxon_ranks',
    { id: resolvedRankId ?? '' },
    { enabled: hasValue(resolvedRankId) }
  );

  const {
    data: parentRows = [],
    isPending: parentRowsPending,
  } = useGetList(
    'taxon_name_parents',
    {
      filter: { taxon_name_id: recordId },
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'sequence', order: 'ASC' },
    },
    { enabled: Boolean(recordId) }
  );

  const {
    data: authorRows = [],
    isPending: authorRowsPending,
  } = useGetList(
    'citations',
    {
      filter: { taxon_name_id: recordId },
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'author_order', order: 'ASC' },
    },
    { enabled: Boolean(recordId) }
  );

  const {
    data: hierarchyRows = [],
    isPending: hierarchyRowsPending,
  } = useGetList(
    'hierarchies',
    {
      filter: { taxon_name_id: recordId },
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'path', order: 'ASC' },
    },
    { enabled: Boolean(recordId) }
  );

  const requirements = React.useMemo<ValidationRequirement[]>(
    () => {
      const rankName = rankRecord?.rank_name?.toLowerCase() ?? '';
      const needsInformalGroup = FAMILY_AND_BELOW_RANKS.has(rankName);
      const needsSpecificEpithet = SPECIES_RANKS.has(rankName) || INFRASPECIFIC_RANKS.has(rankName);
      const needsInfraspecificEpithet = INFRASPECIFIC_RANKS.has(rankName);

      return [
      { key: 'kingdom', label: 'Kingdom', met: hasValue(kingdomId) },
      {
        key: 'rank',
        label: 'Rank',
        met: hasValue(rankId) || hasValue(taxonRankId),
        pending: hasValue(resolvedRankId) && rankPending,
      },
      {
        key: 'parent',
        label: 'Parent',
        met: Boolean(recordId) && parentRows.length > 0,
        pending: Boolean(recordId) && parentRowsPending,
      },
      {
        key: 'authors',
        label: 'Author/s',
        met: Boolean(recordId) && authorRows.length > 0,
        pending: Boolean(recordId) && authorRowsPending,
      },
      {
        key: 'hierarchy',
        label: 'Hierarchy',
        met: Boolean(recordId) && hierarchyRows.length > 0,
        pending: Boolean(recordId) && hierarchyRowsPending,
      },
      {
        key: 'publication_status',
        label: 'Publication status',
        met: hasValue(publicationStatus),
      },
      { key: 'is_current', label: 'Current', met: isCurrent === true },
      {
        key: 'informal_group',
        label: 'Informal group',
        met: !needsInformalGroup || Boolean(classificationSystemIds?.length),
        pending: hasValue(resolvedRankId) && rankPending,
      },
      {
        key: 'contributed_by',
        label: 'Contributed by',
        met: hasValue(contributedBy),
      },
      {
        key: 'contributed_on',
        label: 'Contributed on',
        met: hasValidDate(contributedOn),
      },
      {
        key: 'authorised_by',
        label: 'Authorised by',
        met: hasValue(authorisedBy),
      },
      {
        key: 'authorised_on',
        label: 'Authorised on',
        met: hasValidDate(authorisedOn),
      },
      {
        key: 'naturalised_status',
        label: 'Naturalised status',
        met: hasValue(naturalisedStatus),
      },
      {
        key: 'specific_epithet',
        label: 'Parallel specific epithet',
        met: !needsSpecificEpithet || hasValue(parallelSpecificEpithet),
        pending: hasValue(resolvedRankId) && rankPending,
      },
      {
        key: 'infraspecific_epithet',
        label: 'Parallel infraspecific epithet',
        met: !needsInfraspecificEpithet || hasValue(parallelInfraspecificEpithet),
        pending: hasValue(resolvedRankId) && rankPending,
      },
    ];
    },
    [
      authorRows.length,
      authorRowsPending,
      authorisedBy,
      authorisedOn,
      classificationSystemIds?.length,
      contributedBy,
      contributedOn,
      hierarchyRows.length,
      hierarchyRowsPending,
      isCurrent,
      kingdomId,
      naturalisedStatus,
      parallelInfraspecificEpithet,
      parallelSpecificEpithet,
      parentRows.length,
      parentRowsPending,
      publicationStatus,
      rankId,
      rankPending,
      rankRecord?.rank_name,
      recordId,
      resolvedRankId,
      taxonRankId,
    ]
  );

  const missingRequirements = React.useMemo(
    () => getMissingValidationRequirements(requirements),
    [requirements]
  );
  const isLoadingRequirements = requirements.some((requirement) => requirement.pending);
  const canValidate = !isLoadingRequirements && missingRequirements.length === 0;

  const statusBadge = (
    <Badge
      variant={canValidate ? 'default' : 'secondary'}
      className={cn(
        !canValidate &&
          'border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-100'
      )}
    >
      Ready to validate
    </Badge>
  );

  const helperText = canValidate ? null : (
    <span className="text-sm text-amber-900">
      {isLoadingRequirements
        ? 'Checking validation requirements...'
        : `Missing: ${missingRequirements.join(', ')}`}
    </span>
  );

  return (
    <BooleanInput
      source="validated"
      label={
        <span className="flex flex-wrap items-center gap-2">
          <span>Validated</span>
          {canValidate ? statusBadge : null}
        </span>
      }
      helperText={helperText}
    />
  );
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
            perPage={200}
          >
            <AutocompleteInput
              optionText={formatRankOption}
              validate={requiredValue}
              disabled={!kingdomId}
            />
          </ReferenceInput>

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
          <TextInput source="legacy_id" label="LegacyID" className="xl:col-span-4" />

          <div className="mt-8 space-y-4 rounded-2xl border border-border/80 bg-muted/10 p-4 md:col-span-2 xl:col-span-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold tracking-tight">Status</h3>
            </div>
            <div className="grid max-w-2xl gap-4">
              <SelectInput source="publication_status" choices={PublicationStatus} />
              <BooleanInput source="is_current" label="Current" />
              <ValidatedInput />
              <BooleanInput source="is_wa_recognised" label="WA census" />
              <BooleanInput source="review" label="Review?" />
              {review ? (
                <TextInput
                  source="review_reason"
                  label="Review reason"
                  validate={validateReviewReason}
                />
              ) : null}
            </div>
          </div>
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
          <TextInput source="comments" label="Internal comments" multiline />
          <TextInput source="external_comments" label="External comments" multiline />
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
