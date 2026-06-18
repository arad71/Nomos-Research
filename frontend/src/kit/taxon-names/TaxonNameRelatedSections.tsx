import * as React from 'react';
import {
  RecordContextProvider,
  useCanAccess,
  useDataProvider,
  useGetOne,
  useListContext,
  useNotify,
  useRecordContext,
  useRefresh,
} from 'ra-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreateInDialogButton,
  EditInDialogButton,
} from '@react-admin/ra-form-layout';
import { ThemeProvider, createTheme } from '@mui/material';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { DataTable } from '@/components/admin/data-table';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceInput } from '@/components/admin/reference-input';
import { ReferenceArrayField } from '@/components/admin/reference-array-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { ReferenceManyField } from '@/components/admin/reference-many-field';
import { SelectInput } from '@/components/admin/select-input';
import { SingleFieldList } from '@/components/admin/single-field-list';
import { TextInput } from '@/components/admin/text-input';
import { DateField } from '@/components/admin/date-field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BooleanField as RaBooleanField,
  NumberField as RaNumberField,
  useGetMany,
  useGetList,
} from 'react-admin';
import { getCrossRefTypeLabel } from '../shared/choices/CrossRefType';
import { formatDateOnly } from '../shared/dateOnlyDateTime';
import NaturalisedStatus from '../shared/choices/NaturalisedStatus';
import PublicationStatus from '../shared/choices/PublicationStatus';
import CitationForm from '../citations/CitationForm';
import ConscodeTaxonForm from '../conscode-taxons/ConscodeTaxonForm';
import CrossReferenceForm from '../cross-references/CrossReferenceForm';
import HierarchyForm from '../hierarchies/HierarchyForm';
import TaxonNameParentForm from '../taxon-name-parents/TaxonNameParentForm';
import PublicationForm from '../publications/PublicationForm';
import PublicationReferenceSection from '../taxon-publications/PublicationReferenceSection';
import HybridCategory from '../shared/choices/HybridCategory';
import {
  normalizeDoi,
  transformPublicationPayload,
} from '../shared/publicationDoi';
import VernacularForm from '../vernaculars/VernacularForm';
import { formatAuthorOption } from '../authors/authorDisplay';
import {
  getStoredRoles,
  hasAnyRole,
  HYBRID_ROLLOUT_ROLES,
} from '../../adminShell';

const LEGACY_PUBLICATION_ROLES = ['SUPER_ADMIN', 'APPLICATION_SUPPORT'];

const INFRASPECIFIC_RANK_ABBREVIATIONS = [
  'nothovar.',
  'subsect.',
  'subvar.',
  'subser.',
  'subsp.',
  'subf.',
  'sect.',
  'ser.',
  'var.',
  'cv.',
];

const rankAbbreviationPattern = INFRASPECIFIC_RANK_ABBREVIATIONS.map((rank) =>
  rank.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
).join('|');

const italicizedRankPattern = new RegExp(
  `<i>([^<]*?)\\s+(${rankAbbreviationPattern})\\s+([^<]*?)<\\/i>`,
  'g'
);

const normalizeFormattedScientificName = (value?: string | null) => {
  if (!value) {
    return value;
  }

  return value.replace(
    italicizedRankPattern,
    (_, nameBeforeRank: string, rankAbbreviation: string, nameAfterRank: string) =>
      [
        nameBeforeRank?.trim() ? `<i>${nameBeforeRank.trim()}</i>` : null,
        rankAbbreviation,
        nameAfterRank?.trim() ? `<i>${nameAfterRank.trim()}</i>` : null,
      ]
        .filter(Boolean)
        .join(' ')
  );
};

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: normalizeFormattedScientificName(value) ?? '',
      }}
    />
  );
};

const formatPreviewTitle = (value?: string | null) => {
  if (!value) {
    return 'Not set';
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatTitle = formatPreviewTitle;

const renderScientificName = (taxon?: {
  formatted_scientific_name?: string | null;
  scientific_name?: string | null;
}) => {
  if (taxon?.formatted_scientific_name) {
    return <HtmlValue value={taxon.formatted_scientific_name} />;
  }

  return taxon?.scientific_name ?? '';
};

type ParentLinkRecord = {
  id?: string | number;
  taxon_name_id?: string | number;
  parent_taxon_name_id?: string | number;
  sequence?: number | string | null;
};

type ParallelNamePreviewRecord = {
  id?: string | number;
  taxon_name_id?: string | number;
  strategy?: string | null;
  notes?: string[] | null;
  current_uninomial?: string | null;
  current_canonical_name?: string | null;
  current_scientific_name?: string | null;
  current_formatted_scientific_name?: string | null;
  derived_uninomial?: string | null;
  derived_canonical_name?: string | null;
  derived_scientific_name?: string | null;
  derived_formatted_scientific_name?: string | null;
  matches_current_uninomial?: boolean;
  matches_current_scientific_name?: boolean;
  parent_taxon_name_ids?: Array<string | number> | null;
};

const validateHybridCategory = (
  value?: string | null,
  allValues?: { is_hybrid?: boolean }
) => {
  if (allValues?.is_hybrid && !value) {
    return 'Hybrid category is required when this taxon name is marked as a hybrid';
  }

  return undefined;
};

const ParentHybridFields = ({ editable }: { editable?: boolean }) => {
  const record = useRecordContext<{
    id?: string | number;
    is_hybrid?: boolean | null;
    hybrid_category?: string | null;
  }>();

  if (editable) {
    const { setValue } = useFormContext<{
      is_hybrid?: boolean;
      hybrid_category?: string | null;
    }>();
    const isHybrid = useWatch({ name: 'is_hybrid' });
    const hybridCategory = useWatch({ name: 'hybrid_category' });
    const recordId = record?.id;
    const { data: parentRows = [] } = useGetList(
      'taxon_name_parents',
      {
        filter: { taxon_name_id: recordId },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'sequence', order: 'ASC' },
      },
      { enabled: Boolean(recordId) }
    );
    const hasMultipleParents = parentRows.length > 1;

    React.useEffect(() => {
      if (!isHybrid) {
        setValue('hybrid_category', null, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }, [isHybrid, setValue]);

    React.useEffect(() => {
      if (hasMultipleParents && !isHybrid) {
        setValue('is_hybrid', true, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }, [hasMultipleParents, isHybrid, setValue]);

    return (
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectInput
          source="is_hybrid"
          label="Hybrid"
          choices={[
            { id: true, name: 'Yes' },
            { id: false, name: 'No' },
          ]}
          format={(value) => {
            if (value === true || value === 'true') return true;
            if (value === false || value === 'false') return false;
            return value;
          }}
          parse={(value) => {
            if (value === true || value === 'true') return true;
            if (value === false || value === 'false') return false;
            return value;
          }}
          disabled={hasMultipleParents}
          helperText={
            hasMultipleParents
              ? 'Automatically set to Yes when more than one parent row exists.'
              : undefined
          }
        />
        {isHybrid ? (
          <SelectInput
            source="hybrid_category"
            label="Hybrid category"
            choices={HybridCategory}
            validate={validateHybridCategory}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
      <RecordField
        label="Hybrid"
        render={(taxon: { is_hybrid?: boolean | null }) =>
          renderBoolean(taxon.is_hybrid)
        }
        record={record}
      />
      <RecordField
        source="hybrid_category"
        label="Hybrid category"
        record={record}
      >
        <RecordField
          label=""
          record={record}
          render={(taxon: { hybrid_category?: string | null }) =>
            renderChoice(HybridCategory, taxon.hybrid_category)
          }
        />
      </RecordField>
    </div>
  );
};

const ParallelNamePreviewPanel = ({
  recordId,
}: {
  recordId?: string | number;
}) => {
  const record = useRecordContext<{
    formatted_scientific_name?: string | null;
    scientific_name?: string | null;
    legacy_scientific_name?: string | null;
    legacy_canonical_name?: string | null;
  }>();
  const { data, isPending, error } = useGetOne<ParallelNamePreviewRecord>(
    'taxon_names_parallel_name_preview',
    { id: recordId, meta: { strict: true } },
    { enabled: recordId != null }
  );

  if (!recordId) {
    return null;
  }

  if (isPending) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Loading parallel name preview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Unable to load the parallel name preview right now.
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-medium">
            Scientific and legacy names
          </div>
          <Badge className="border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/50 dark:text-sky-100">
            {formatPreviewTitle(data.strategy)}
          </Badge>
        </div>
        <Badge className="border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/50 dark:text-sky-100">
          Parallel derived
        </Badge>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Scientific name
          </div>
          <div className="text-sm">
            {data.derived_formatted_scientific_name ? (
              <HtmlValue value={data.derived_formatted_scientific_name} />
            ) : data.derived_scientific_name ? (
              data.derived_scientific_name
            ) : record?.formatted_scientific_name ? (
              <HtmlValue value={record.formatted_scientific_name} />
            ) : (
              record?.scientific_name || 'Unable to derive yet'
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Legacy scientific name
          </div>
          <div className="text-sm">
            {record?.legacy_scientific_name || 'Not set'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Canonical name
          </div>
          <div className="text-sm">
            {data.derived_canonical_name || 'Unable to derive yet'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Legacy canonical name
          </div>
          <div className="text-sm">
            {record?.legacy_canonical_name || 'Not set'}
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Scientific name is derived from the parallel fields. Legacy names are
        retained from the old name parts.
      </div>
    </div>
  );
};

const DerivedScientificNameSummaryField = ({
  recordId,
}: {
  recordId?: string | number;
}) => {
  const { data, isPending } = useGetOne<ParallelNamePreviewRecord>(
    'taxon_names_parallel_name_preview',
    { id: recordId as string | number, meta: { strict: true } },
    { enabled: recordId != null }
  );

  if (recordId == null) {
    return null;
  }

  return (
    <RecordField
      label="Derived scientific name"
      className="md:col-span-1 xl:min-w-0"
      render={() => {
        if (isPending) {
          return 'Loading...';
        }

        if (data?.derived_formatted_scientific_name) {
          return <HtmlValue value={data.derived_formatted_scientific_name} />;
        }

        return data?.derived_scientific_name ?? 'Not set';
      }}
    />
  );
};

const CreateParentNameRowButton = ({
  recordId,
}: {
  recordId: string | number;
}) => {
  const { data = [], isPending } = useGetList<ParentLinkRecord>(
    'taxon_name_parents',
    {
      filter: { taxon_name_id: recordId },
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'sequence', order: 'DESC' },
    },
    { enabled: Boolean(recordId) }
  );

  const nextSequence = React.useMemo(() => {
    const maxSequence = data.reduce((currentMax, row) => {
      const value = Number(row.sequence ?? 0);
      return Number.isFinite(value) ? Math.max(currentMax, value) : currentMax;
    }, 0);

    return maxSequence + 1;
  }, [data]);

  return (
    <CreateInDialogButton
      resource="taxon_name_parents"
      record={{ taxon_name_id: recordId, sequence: nextSequence }}
      fullWidth
      maxWidth="md"
      title="Create parent name row"
      label="Create parent name row"
      ButtonProps={{ ...relatedDialogButtonProps, disabled: isPending }}
    >
      <DialogFormPadding>
        <TaxonNameParentForm hideTaxonName />
      </DialogFormPadding>
    </CreateInDialogButton>
  );
};

const ParentSequenceButtons = () => {
  const record = useRecordContext<ParentLinkRecord>();
  const { data = [] } = useListContext<ParentLinkRecord>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [isMoving, setIsMoving] = React.useState(false);

  const orderedRows = React.useMemo(
    () =>
      [...data].sort(
        (left, right) =>
          Number(left.sequence ?? 0) - Number(right.sequence ?? 0)
      ),
    [data]
  );

  const currentIndex = React.useMemo(
    () =>
      orderedRows.findIndex(
        (row) => String(row.id ?? '') === String(record?.id ?? '')
      ),
    [orderedRows, record?.id]
  );

  const moveRow = React.useCallback(
    async (direction: -1 | 1) => {
      if (!record?.id || currentIndex < 0) {
        return;
      }

      const swapIndex = currentIndex + direction;
      if (swapIndex < 0 || swapIndex >= orderedRows.length) {
        return;
      }

      const currentRow = orderedRows[currentIndex];
      const targetRow = orderedRows[swapIndex];

      if (!targetRow?.id) {
        return;
      }

      const currentSequence = Number(currentRow.sequence ?? 0);
      const targetSequence = Number(targetRow.sequence ?? 0);
      const temporarySequence =
        orderedRows.reduce((maxValue, row) => {
          const value = Number(row.sequence ?? 0);
          return Number.isFinite(value) ? Math.max(maxValue, value) : maxValue;
        }, 0) + 1;

      setIsMoving(true);

      try {
        await dataProvider.update('taxon_name_parents', {
          id: currentRow.id,
          data: { ...currentRow, sequence: temporarySequence },
          previousData: currentRow,
        });
        await dataProvider.update('taxon_name_parents', {
          id: targetRow.id,
          data: { ...targetRow, sequence: currentSequence },
          previousData: targetRow,
        });
        await dataProvider.update('taxon_name_parents', {
          id: currentRow.id,
          data: { ...currentRow, sequence: targetSequence },
          previousData: currentRow,
        });
        refresh();
      } catch (error) {
        notify(
          error instanceof Error
            ? error.message
            : 'Failed to update parent order',
          { type: 'error' }
        );
      } finally {
        setIsMoving(false);
      }
    },
    [currentIndex, dataProvider, notify, orderedRows, record?.id, refresh]
  );

  if (!record?.id || currentIndex < 0 || orderedRows.length < 2) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === orderedRows.length - 1;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() => void moveRow(-1)}
        disabled={isMoving || isFirst}
        aria-label="Move parent name row up"
      >
        <ArrowUp />
        Up
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() => void moveRow(1)}
        disabled={isMoving || isLast}
        aria-label="Move parent name row down"
      >
        <ArrowDown />
        Down
      </Button>
    </div>
  );
};

const renderBoolean = (value?: boolean | null) => {
  if (value == null) return '';
  return value ? 'Yes' : 'No';
};

const renderChoice = (
  choices: Array<{ id: string; name: string }>,
  value?: string | null
) => {
  if (!value) return '';
  return choices.find((choice) => choice.id === value)?.name ?? value;
};

const SectionHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="space-y-1">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
    {action}
  </div>
);

const TaxonNameCodeButton = () => {
  const record = useRecordContext<{ id?: string | number }>();
  if (record?.id == null) return null;

  return (
    <Button asChild variant="outline">
      <Link to={`/taxon_names_code/${record.id}`}>
        Open conservation code page
      </Link>
    </Button>
  );
};

const OpenConservationCodeRelatedButton = () => {
  const record = useRecordContext<{ id?: string | number }>();
  if (record?.id == null) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link to={`/conscode_taxons/${record.id}/show`}>Open</Link>
    </Button>
  );
};

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
    {children}
  </div>
);

const RelatedFetchError = ({ resourceLabel }: { resourceLabel: string }) => (
  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-muted-foreground">
    Unable to load {resourceLabel} right now.
  </div>
);

const RelatedCreateButton = ({ to, label }: { to: string; label: string }) => (
  <Button asChild variant="outline">
    <Link to={to}>{label}</Link>
  </Button>
);

const PublicationDoiLink = ({ value }: { value?: string | null }) => {
  const normalized = normalizeDoi(value);

  if (!normalized) {
    return null;
  }

  return (
    <a
      href={normalized}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4"
      onClick={(event) => event.stopPropagation()}
    >
      {normalized}
    </a>
  );
};

const EnterpriseDialogThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains('dark')
  );

  React.useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });

    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const muiTheme = React.useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    const background = styles.getPropertyValue('--background').trim();
    const foreground = styles.getPropertyValue('--foreground').trim();
    const card = styles.getPropertyValue('--card').trim();
    const cardForeground = styles.getPropertyValue('--card-foreground').trim();
    const border = styles.getPropertyValue('--border').trim();
    const primary = styles.getPropertyValue('--primary').trim();
    const primaryForeground = styles
      .getPropertyValue('--primary-foreground')
      .trim();

    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: primary,
          contrastText: primaryForeground,
        },
        background: {
          default: background,
          paper: card,
        },
        text: {
          primary: foreground,
          secondary: cardForeground,
        },
        divider: border,
      },
    });
  }, [isDark]);

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

const relatedDialogButtonProps = {
  variant: 'outlined' as const,
  size: 'small' as const,
  sx: {
    borderRadius: '0.5rem',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
    backgroundColor: 'var(--background)',
    boxShadow: 'none',
    textTransform: 'none',
    fontWeight: 500,
    minWidth: 'auto',
    '&:hover': {
      borderColor: 'var(--border)',
      backgroundColor: 'var(--accent)',
      boxShadow: 'none',
    },
  },
};

const EditRelatedButton = ({
  children,
  id,
  label = 'Edit',
  resource,
  title,
}: {
  children: React.ReactNode;
  id?: string | number;
  label?: string;
  resource?: string;
  title?: string;
}) => (
  <EditInDialogButton
    resource={resource}
    {...(id != null ? { id } : {})}
    fullWidth
    maxWidth="md"
    title={title ?? label}
    label={label}
    ButtonProps={{
      ...relatedDialogButtonProps,
      variant: 'contained',
      sx: {
        ...relatedDialogButtonProps.sx,
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        borderColor: 'var(--primary)',
        '&:hover': {
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          borderColor: 'var(--primary)',
          filter: 'brightness(0.96)',
          boxShadow: 'none',
        },
      },
    }}
  >
    {children}
  </EditInDialogButton>
);

const DeleteRelatedButton = ({ resource }: { resource: string }) => {
  const { canAccess, isPending } = useCanAccess({ resource, action: 'delete' });

  if (isPending || !canAccess) {
    return null;
  }

  return (
    <DeleteButton
      resource={resource}
      redirect={false}
      label="Delete"
      size="sm"
      variant="outline"
    />
  );
};

const DialogFormPadding = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-2 sm:px-6">{children}</div>
);

type RelatedNameCardRecord = {
  id?: string | number;
  cross_reference_id?: string | number;
  old_name_id?: string | number | null;
  new_name_id?: string | number | null;
  cross_reference_type?: string | null;
  reference_comments?: string | null;
  is_active?: boolean | null;
};

const RelatedNameCards = ({
  nameSource,
  directionLabel,
  editable = false,
  showOpenAction = true,
}: {
  nameSource: 'old_name_id' | 'new_name_id';
  directionLabel: string;
  editable?: boolean;
  showOpenAction?: boolean;
}) => {
  const { data } = useListContext<RelatedNameCardRecord>();

  if (!data?.length) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {data.map((crossRef) => {
        const crossReferenceId = crossRef.cross_reference_id ?? crossRef.id;
        const relatedTaxonId = crossRef[nameSource];
        const cardRecord = { ...crossRef, id: crossReferenceId };

        return (
          <RecordContextProvider key={String(crossReferenceId)} value={cardRecord}>
            <Card className="gap-0 rounded-lg border-border bg-card py-0 shadow-none">
              <CardHeader className="border-b border-border px-4 pb-2 pt-3 [.border-b]:pb-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="w-fit">
                    {directionLabel}
                  </Badge>
                  <Badge variant="outline" className="w-fit">
                    {getCrossRefTypeLabel(crossRef.cross_reference_type)}
                  </Badge>
                  <Badge
                    variant={crossRef.is_active === false ? 'outline' : 'secondary'}
                    className="w-fit"
                  >
                    {crossRef.is_active === false ? 'Inactive' : 'Active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4 py-3">
                <div className="min-w-0">
                  <ReferenceField
                    source={nameSource}
                    reference="taxon_names"
                    link="show"
                  >
                    <RecordField
                      label=""
                      render={(taxon: {
                        formatted_scientific_name?: string | null;
                      }) => (
                        <span className="block text-base font-medium leading-6 text-foreground">
                          <HtmlValue value={taxon.formatted_scientific_name} />
                        </span>
                      )}
                    />
                  </ReferenceField>
                </div>
                {crossRef.reference_comments ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {crossRef.reference_comments}
                  </p>
                ) : null}
              </CardContent>
              {editable ? (
                <CardFooter className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 pb-3 pt-3 [.border-t]:pt-3">
                  <EditRelatedButton label="Edit reference">
                    <DialogFormPadding>
                      <CrossReferenceForm
                        hideNewName={nameSource === 'old_name_id'}
                        hideOldName={nameSource === 'new_name_id'}
                      />
                    </DialogFormPadding>
                  </EditRelatedButton>
                  <DeleteRelatedButton resource="cross_references" />
                </CardFooter>
              ) : null}
              {showOpenAction &&
              !editable &&
              (crossReferenceId != null || relatedTaxonId != null) ? (
                <CardFooter className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 pb-3 pt-3 [.border-t]:pt-3">
                  {crossReferenceId != null ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/cross_references/${crossReferenceId}/show`}>
                        Open reference
                      </Link>
                    </Button>
                  ) : null}
                  {relatedTaxonId != null ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/taxon_names/${relatedTaxonId}/show`}>
                        Open taxon
                      </Link>
                    </Button>
                  ) : null}
                </CardFooter>
              ) : null}
            </Card>
          </RecordContextProvider>
        );
      })}
    </div>
  );
};

const PublicationEditableSection = () => {
  const form = useFormContext();
  const publicationId = form.watch('publication_id');
  const { data: publication } = useGetOne(
    'publications',
    { id: publicationId ?? '' },
    { enabled: publicationId != null && publicationId !== '' }
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <ReferenceInput
          source="publication_id"
          reference="publications"
          sort={{ field: 'abbreviated_title', order: 'ASC' }}
          perPage={200}
          className="w-full"
        >
          <AutocompleteInput optionText="display_title" label="Publication" />
        </ReferenceInput>
        {publicationId ? (
          <Button asChild variant="outline">
            <Link to={`/publications/${publicationId}/show`}>
              Open publication
            </Link>
          </Button>
        ) : null}
      </div>
      {publication ? (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Abbreviated title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>DOI</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{publication.abbreviated_title ?? ''}</TableCell>
                <TableCell>{publication.publication_year ?? ''}</TableCell>
                <TableCell>
                  <PublicationDoiLink value={publication.doi} />
                </TableCell>
                <TableCell>
                  <EditPublicationButton />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState>
          Select or create a publication to link it to this taxon name.
        </EmptyState>
      )}
    </div>
  );
};

const PublicationReadOnlySection = () => {
  const record = useRecordContext<{
    publication_id?: string | number | null;
  }>();
  const navigate = useNavigate();
  const publicationId = record?.publication_id;
  const { data: publication } = useGetOne(
    'publications',
    { id: publicationId ?? '' },
    { enabled: publicationId != null && publicationId !== '' }
  );

  if (!publicationId) {
    return <EmptyState>No publication linked to this taxon name.</EmptyState>;
  }

  if (!publication) {
    return <EmptyState>Loading publication details...</EmptyState>;
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Abbreviated title</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>DOI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            className="cursor-pointer"
            onDoubleClick={() => {
              if (publicationId != null) {
                navigate(`/publications/${publicationId}/show`);
              }
            }}
          >
            <TableCell>{publication.abbreviated_title ?? ''}</TableCell>
            <TableCell>{publication.publication_year ?? ''}</TableCell>
            <TableCell>
              <PublicationDoiLink value={publication.doi} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

const LegacyPublicationDataSection = () => {
  const record = useRecordContext<{
    publication_id?: string | number | null;
    publication_year?: string | number | null;
    form_desc_yr?: string | number | null;
    reference?: string | null;
    volume_information?: string | null;
  }>();
  const hasLegacyPublicationData =
    record?.publication_id != null ||
    record?.publication_year != null ||
    record?.form_desc_yr != null ||
    Boolean(record?.reference) ||
    Boolean(record?.volume_information);

  if (!hasLegacyPublicationData) {
    return null;
  }

  return (
    <section className="mt-6 space-y-4 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
      <SectionHeader
        title="Legacy publication data"
        description="Legacy publication values retained on the taxon name record during the publication-reference migration."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <RecordField
          label="Volume information"
          record={record}
          render={(taxon: { volume_information?: string | null }) =>
            taxon.volume_information ?? ''
          }
        />
        <RecordField
          label="Publication year"
          record={record}
          render={(taxon: {
            publication_year?: string | number | null;
            form_desc_yr?: string | number | null;
          }) =>
            taxon.publication_year ??
            taxon.form_desc_yr ??
            ''
          }
        />
        <RecordField
          label="Reference"
          record={record}
          render={(taxon: { reference?: string | null }) =>
            taxon.reference ?? ''
          }
        />
        <RecordField
          label="Publication ID"
          record={record}
          render={(taxon: { publication_id?: string | number | null }) =>
            taxon.publication_id ?? ''
          }
        />
      </div>
    </section>
  );
};

const CreatePublicationButton = () => {
  const form = useFormContext();
  const publicationId = form.watch('publication_id');

  if (publicationId) {
    return null;
  }

  return (
    <CreateInDialogButton
      resource="publications"
      fullWidth
      maxWidth="lg"
      transform={transformPublicationPayload}
      title="Create publication"
      label="Create publication"
      mutationOptions={{
        onSuccess: (data: {
          id?: string | number;
          publication_id?: string | number;
        }) => {
          const nextPublicationId = data?.publication_id ?? data?.id;
          if (nextPublicationId != null) {
            form.setValue('publication_id', nextPublicationId, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }
        },
      }}
      ButtonProps={relatedDialogButtonProps}
    >
      <DialogFormPadding>
        <PublicationForm />
      </DialogFormPadding>
    </CreateInDialogButton>
  );
};

const EditPublicationButton = () => {
  const form = useFormContext();
  const publicationId = form.watch('publication_id');

  if (!publicationId) {
    return null;
  }

  return (
    <EditInDialogButton
      resource="publications"
      id={publicationId}
      fullWidth
      maxWidth="lg"
      transform={transformPublicationPayload}
      title="Edit publication"
      label="Edit publication"
      ButtonProps={{
        ...relatedDialogButtonProps,
        variant: 'contained',
        sx: {
          ...relatedDialogButtonProps.sx,
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          borderColor: 'var(--primary)',
          '&:hover': {
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderColor: 'var(--primary)',
            filter: 'brightness(0.96)',
            boxShadow: 'none',
          },
        },
      }}
    >
      <DialogFormPadding>
        <PublicationForm />
      </DialogFormPadding>
    </EditInDialogButton>
  );
};

type RelatedSectionKey =
  | 'parallelNamePreview'
  | 'authors'
  | 'publicationReferences'
  | 'publication'
  | 'parents'
  | 'vernaculars'
  | 'hierarchy'
  | 'relatedNames'
  | 'conservationCodes';

type TaxonNameRelatedSectionsProps = {
  editable?: boolean;
  embedded?: boolean;
  sections?: RelatedSectionKey[];
};

type CitationRowRecord = {
  id?: string | number;
  citation_id?: string | number;
  author_id?: string | number | null;
  author_type?: string | null;
  author_order?: number | null;
};

const CitationRows = ({
  editable,
  recordId,
}: {
  editable: boolean;
  recordId: string | number;
}) => {
  const { data = [], isPending, error } = useGetList<CitationRowRecord>(
    'citations',
    {
      filter: { taxon_name_id: recordId },
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'author_order', order: 'ASC' },
    },
    { enabled: Boolean(recordId) }
  );

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Loading citations...</div>;
  }

  if (error) {
    return (
      <EmptyState>
        {error instanceof Error
          ? `Could not load citations for this taxon name: ${error.message}`
          : 'Could not load citations for this taxon name.'}
      </EmptyState>
    );
  }

  if (!data.length) {
    return <EmptyState>No citations linked to this taxon name yet.</EmptyState>;
  }

  return (
    <div className="min-w-0 max-w-full rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Author type</TableHead>
            <TableHead>Order</TableHead>
            {editable ? <TableHead>Actions</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((citation, index) => (
            <RecordContextProvider
              key={citation.id ?? citation.citation_id ?? index}
              value={citation}
            >
              <TableRow>
                <TableCell>
                  <ReferenceField
                    source="author_id"
                    reference="authors"
                    link={editable ? 'show' : false}
                  >
                    <RecordField label="" render={formatAuthorOption} />
                  </ReferenceField>
                </TableCell>
                <TableCell>{citation.author_type ?? ''}</TableCell>
                <TableCell>{citation.author_order ?? ''}</TableCell>
                {editable ? (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EditRelatedButton
                        id={citation.id ?? citation.citation_id}
                        resource="citations"
                        label="Edit citation"
                      >
                        <DialogFormPadding>
                          <CitationForm hideTaxonName />
                        </DialogFormPadding>
                      </EditRelatedButton>
                      <DeleteRelatedButton resource="citations" />
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            </RecordContextProvider>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const TaxonNameRelatedSections = ({
  editable = false,
  embedded = false,
  sections,
}: TaxonNameRelatedSectionsProps) => {
  const record = useRecordContext<{ id?: string | number }>();
  const recordId = record?.id;
  const navigate = useNavigate();
  const refresh = useRefresh();
  const canViewHybridRollout = hasAnyRole(
    getStoredRoles(),
    HYBRID_ROLLOUT_ROLES
  );
  const canViewLegacyPublication = hasAnyRole(
    getStoredRoles(),
    LEGACY_PUBLICATION_ROLES
  );
  const visibleSections = new Set<RelatedSectionKey>(
    sections ?? [
      'authors',
      'publicationReferences',
      'publication',
      'parents',
      'vernaculars',
      'hierarchy',
      'relatedNames',
      'conservationCodes',
    ]
  );

  return (
    <EnterpriseDialogThemeProvider>
      <div
        className={
          embedded
            ? 'min-w-0 space-y-0'
            : 'min-w-0 space-y-0 rounded-2xl border border-border bg-card p-6'
        }
      >
        {editable &&
        visibleSections.has('parallelNamePreview') &&
        canViewHybridRollout ? (
          <section className="space-y-4">
            <ParallelNamePreviewPanel recordId={recordId} />
          </section>
        ) : null}

        {!editable ? (
          <>
            {visibleSections.has('parents') && canViewHybridRollout ? (
              <section className="space-y-4">
                <ParallelNamePreviewPanel recordId={recordId} />
              </section>
            ) : null}

            <section className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">
                Taxon name
              </h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <RecordField
                  label="NomosID"
                  className="min-w-0"
                  render={(taxon: {
                    id?: string | number | null;
                    taxon_name_id?: string | number | null;
                  }) => taxon.taxon_name_id ?? taxon.id ?? ''}
                />
                <RecordField
                  label="Formatted scientific name"
                  className="min-w-0 md:col-start-2 xl:col-start-2 xl:col-span-3"
                  render={(taxon: {
                    formatted_scientific_name?: string | null;
                  }) => <HtmlValue value={taxon.formatted_scientific_name} />}
                />
                <RecordField
                  source="canonical_name"
                  label="Canonical name"
                  className="min-w-0 md:col-start-2 xl:col-start-2 xl:col-span-3"
                />
              </div>
              <SectionHeader title="Taxonomic placement" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <RecordField label="Kingdom" source="kingdom_id">
                  <ReferenceField
                    source="kingdom_id"
                    reference="kingdoms"
                    link={false}
                  >
                    <RecordField
                      source="kingdom_name"
                      label=""
                      render={(kingdom: {
                        kingdom_name?: string | null;
                        id?: string | number | null;
                      }) => (
                        <span
                          className="cursor-pointer"
                          onDoubleClick={() => {
                            if (kingdom.id != null) {
                              navigate(`/kingdoms/${kingdom.id}/show`);
                            }
                          }}
                        >
                          {kingdom.kingdom_name ?? ''}
                        </span>
                      )}
                    />
                  </ReferenceField>
                </RecordField>
                <RecordField label="Rank" source="rank_id">
                  <ReferenceField
                    source="rank_id"
                    reference="taxon_ranks"
                    link={false}
                  >
                    <RecordField
                      source="rank_name"
                      label=""
                      render={(rank: {
                        rank_name?: string | null;
                        id?: string | number | null;
                      }) => (
                        <span
                          className="cursor-pointer"
                          onDoubleClick={() => {
                            if (rank.id != null) {
                              navigate(`/taxon_ranks/${rank.id}/show`);
                            }
                          }}
                        >
                          {rank.rank_name ?? ''}
                        </span>
                      )}
                    />
                  </ReferenceField>
                </RecordField>
                <div
                  className="hidden md:block md:col-span-2 xl:col-span-4"
                  aria-hidden="true"
                />
                <div className="md:col-span-2 xl:col-span-4">
                  <SectionHeader title="Taxonomic status" />
                </div>
                <RecordField
                  source="publication_status"
                  label="Publication status"
                >
                  <RecordField
                    label=""
                    render={(taxon: { publication_status?: string | null }) =>
                      renderChoice(PublicationStatus, taxon.publication_status)
                    }
                  />
                </RecordField>
                <RecordField
                  label="Current"
                  render={(taxon: { is_current?: boolean | null }) =>
                    renderBoolean(taxon.is_current)
                  }
                />
                <RecordField
                  label="Validated"
                  render={(taxon: { validated?: boolean | null }) =>
                    renderBoolean(taxon.validated)
                  }
                />
                <RecordField
                  label="WA census"
                  render={(taxon: { is_wa_recognised?: boolean | null }) =>
                    renderBoolean(taxon.is_wa_recognised)
                  }
                />
                <RecordField
                  label="Hybrid"
                  render={(taxon: { is_hybrid?: boolean | null }) =>
                    renderBoolean(taxon.is_hybrid)
                  }
                />
                <RecordField
                  source="hybrid_category"
                  label="Hybrid category"
                >
                  <RecordField
                    label=""
                    render={(taxon: { hybrid_category?: string | null }) =>
                      renderChoice(HybridCategory, taxon.hybrid_category)
                    }
                  />
                </RecordField>
                <div
                  className="hidden md:block md:col-span-2 xl:col-span-4"
                  aria-hidden="true"
                />
                <div className="md:col-span-2 xl:col-span-4">
                  <SectionHeader title="Taxonomic review" />
                </div>
                <RecordField
                  label="Review"
                  render={(taxon: { review?: boolean | null }) =>
                    renderBoolean(taxon.review)
                  }
                />
                <RecordField
                  source="review_reason"
                  label="Review reason"
                  className="xl:col-span-2"
                />
                <div
                  className="hidden md:block md:col-span-2 xl:col-span-4"
                  aria-hidden="true"
                />
                <div className="md:col-span-2 xl:col-span-4">
                  <SectionHeader title="Taxonomic codes" />
                </div>
                <RecordField
                  label="NomosID"
                  className="xl:min-w-0"
                  render={(taxon: {
                    id?: string | number | null;
                    taxon_name_id?: string | number | null;
                  }) => taxon.taxon_name_id ?? taxon.id ?? ''}
                />
                <RecordField
                  source="legacy_id"
                  label="LegacyID"
                />
                <RecordField
                  source="species_code"
                  label="Species code"
                />
                <div
                  className="hidden md:block md:col-span-2 xl:col-span-4"
                  aria-hidden="true"
                />
                <div className="md:col-span-2 xl:col-span-4">
                  <SectionHeader title="Taxonomic comments" />
                </div>
                <RecordField
                  source="comments"
                  label="Internal comments"
                  className="xl:col-span-4"
                />
                <RecordField
                  source="external_comments"
                  label="External comments"
                  className="xl:col-span-4"
                />
              </div>
            </section>

            <section className="mt-12 space-y-4 border-t border-border pt-12">
              <SectionHeader title="Authority" />
              <div className="grid gap-4 md:grid-cols-2">
                <RecordField source="authorised_by" label="Authorised by" />
                <RecordField source="authorised_on" label="Authorised on">
                  <RecordField
                    label=""
                    render={(taxon: { authorised_on?: string | null }) =>
                      taxon.authorised_on
                        ? formatDateOnly(taxon.authorised_on)
                        : ''
                    }
                  />
                </RecordField>
                <RecordField source="contributed_by" label="Contributed by" />
                <RecordField source="contributed_on" label="Contributed on">
                  <RecordField
                    label=""
                    render={(taxon: { contributed_on?: string | null }) =>
                      taxon.contributed_on
                        ? formatDateOnly(taxon.contributed_on)
                        : ''
                    }
                  />
                </RecordField>
              </div>
            </section>

            <section className="mt-12 space-y-4 border-t border-border pt-12">
              <SectionHeader title="Details" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <RecordField
                  source="naturalised_status"
                  label="Naturalised status"
                >
                  <RecordField
                    label=""
                    render={(taxon: { naturalised_status?: string | null }) =>
                      renderChoice(NaturalisedStatus, taxon.naturalised_status)
                    }
                  />
                </RecordField>
                <RecordField
                  label="Naturalised certainty"
                  render={(taxon: { naturalised_certainty?: boolean | null }) =>
                    renderBoolean(taxon.naturalised_certainty)
                  }
                />
                <RecordField
                  source="naturalised_comments"
                  label="Naturalised comments"
                  className="xl:col-span-4"
                />
                <RecordField label="Informal groups" className="xl:col-span-4">
                  <ReferenceArrayField
                    reference="classification_systems"
                    source="classification_system_ids"
                  >
                    <SingleFieldList>
                      <Badge variant="outline">
                        <RecordField source="class_desc" label="" />
                      </Badge>
                    </SingleFieldList>
                  </ReferenceArrayField>
                </RecordField>
              </div>
            </section>
          </>
        ) : null}

        {editable && visibleSections.has('parents') && canViewHybridRollout ? (
          <>
            <section className={embedded ? 'space-y-4' : 'mt-12 space-y-4'}>
              <SectionHeader
                title="Taxonomic parent names"
                description="Ordered parent-name rows used for hybrid formulas and parent-derived uninomial values."
                action={
                  editable && recordId ? (
                    <CreateParentNameRowButton recordId={recordId} />
                  ) : undefined
                }
              />
              {editable ? (
                recordId ? (
                  <ReferenceManyField
                    reference="taxon_name_parents"
                    target="taxon_name_id"
                    sort={{ field: 'sequence', order: 'ASC' }}
                    empty={
                      <EmptyState>
                        No parent-name rows linked to this taxon name yet.
                      </EmptyState>
                    }
                  >
                    <DataTable rowClick={false} bulkActionButtons={false}>
                      <DataTable.Col source="sequence" label="Sequence" />
                      <DataTable.Col label="Parent name">
                        <ReferenceField
                          source="parent_taxon_name_id"
                          reference="taxon_names"
                          link="show"
                        >
                          <RecordField label="" render={renderScientificName} />
                        </ReferenceField>
                      </DataTable.Col>
                      <DataTable.Col label="Actions">
                        <div className="flex items-center gap-2">
                          <ParentSequenceButtons />
                          <EditRelatedButton
                            resource="taxon_name_parents"
                            label="Edit parent name row"
                          >
                            <DialogFormPadding>
                              <TaxonNameParentForm hideTaxonName />
                            </DialogFormPadding>
                          </EditRelatedButton>
                          <DeleteRelatedButton resource="taxon_name_parents" />
                        </div>
                      </DataTable.Col>
                    </DataTable>
                  </ReferenceManyField>
                ) : (
                  <EmptyState>
                    Save the taxon name first, then you can add parent-name rows
                    inline here.
                  </EmptyState>
                )
              ) : recordId ? (
                <ReferenceManyField
                  reference="taxon_name_parents"
                  target="taxon_name_id"
                  sort={{ field: 'sequence', order: 'ASC' }}
                  empty={
                    <EmptyState>
                      No parent-name rows linked to this taxon name yet.
                    </EmptyState>
                  }
                >
                  <DataTable rowClick={false} bulkActionButtons={false}>
                    <DataTable.Col source="sequence" label="Sequence" />
                    <DataTable.Col label="Parent name">
                      <ReferenceField
                        source="parent_taxon_name_id"
                        reference="taxon_names"
                        link={false}
                      >
                        <RecordField label="" render={renderScientificName} />
                      </ReferenceField>
                    </DataTable.Col>
                  </DataTable>
                </ReferenceManyField>
              ) : null}
              {!editable ? <ParentHybridFields editable={editable} /> : null}
            </section>
          </>
        ) : null}

        {visibleSections.has('authors') ? (
          <section className="mt-12 space-y-4 border-t border-border pt-12">
            <SectionHeader
              title="Authors"
              description="Citation author rows linked to this taxon name."
              action={
                editable && recordId ? (
                  <CreateInDialogButton
                    resource="citations"
                    record={{ taxon_name_id: recordId, author_order: 0 }}
                    fullWidth
                    maxWidth="md"
                    title="Create citation"
                    label="Create citation"
                    mutationOptions={{ onSuccess: refresh }}
                    ButtonProps={relatedDialogButtonProps}
                  >
                    <DialogFormPadding>
                      <CitationForm hideTaxonName />
                    </DialogFormPadding>
                  </CreateInDialogButton>
                ) : undefined
              }
            />
            {editable ? (
              recordId ? (
                <CitationRows editable recordId={recordId} />
              ) : (
                <EmptyState>
                  Save the taxon name first, then you can add citations inline
                  here.
                </EmptyState>
              )
            ) : recordId ? (
              <CitationRows editable={false} recordId={recordId} />
            ) : null}
          </section>
        ) : null}

        {visibleSections.has('publicationReferences') ? (
          <>
            <PublicationReferenceSection
              editable={editable}
              parentId={recordId}
              parentField="taxon_name_id"
              parentLabel="taxon name"
            />
            <LegacyPublicationDataSection />
          </>
        ) : null}

        {visibleSections.has('publication') && canViewLegacyPublication ? (
          <section className="mt-12 space-y-4 rounded-2xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900/60 dark:bg-red-950/20">
            <SectionHeader
              title="Publication"
              description="Linked publication for this taxon name."
              action={editable ? <CreatePublicationButton /> : undefined}
            />
            {editable ? (
              <PublicationEditableSection />
            ) : (
              <PublicationReadOnlySection />
            )}
          </section>
        ) : null}

        {visibleSections.has('vernaculars') ? (
          <section className="mt-12 space-y-4 border-t border-border pt-12">
            <SectionHeader
              title="Vernacular names"
              description="Linked vernacular records."
              action={
                editable && recordId ? (
                  <CreateInDialogButton
                    resource="vernaculars"
                    record={{ taxon_name_id: recordId, sort_order: 0 }}
                    fullWidth
                    maxWidth="md"
                    title="Create vernacular"
                    label="Create vernacular"
                    ButtonProps={relatedDialogButtonProps}
                  >
                    <DialogFormPadding>
                      <VernacularForm hideTaxonName />
                    </DialogFormPadding>
                  </CreateInDialogButton>
                ) : undefined
              }
            />
            {editable ? (
              recordId ? (
                <ReferenceManyField
                  reference="vernaculars"
                  target="taxon_name_id"
                  sort={{ field: 'sort_order', order: 'ASC' }}
                  empty={
                    <EmptyState>
                      No vernacular names linked to this taxon name yet.
                    </EmptyState>
                  }
                >
                  <DataTable bulkActionButtons={false}>
                    <DataTable.Col source="vernacular_name" label="Name" />
                    <DataTable.Col source="language" label="Language" />
                    <DataTable.Col label="Preferred language">
                      <RecordField
                        label=""
                        render={(vernacular: { lang_pref?: boolean | null }) =>
                          renderBoolean(vernacular.lang_pref)
                        }
                      />
                    </DataTable.Col>
                    <DataTable.Col label="Preferred">
                      <RecordField
                        label=""
                        render={(vernacular: { preferred?: boolean | null }) =>
                          renderBoolean(vernacular.preferred)
                        }
                      />
                    </DataTable.Col>
                    <DataTable.Col source="sort_order" label="Sort order" />
                    <DataTable.Col label="Actions">
                      <div className="flex items-center gap-2">
                        <EditRelatedButton label="Edit vernacular">
                          <DialogFormPadding>
                            <VernacularForm hideTaxonName />
                          </DialogFormPadding>
                        </EditRelatedButton>
                        <DeleteRelatedButton resource="vernaculars" />
                      </div>
                    </DataTable.Col>
                  </DataTable>
                </ReferenceManyField>
              ) : (
                <EmptyState>
                  Save the taxon name first, then you can add vernacular names
                  inline here.
                </EmptyState>
              )
            ) : recordId ? (
              <ReferenceManyField
                reference="vernaculars"
                target="taxon_name_id"
                sort={{ field: 'sort_order', order: 'ASC' }}
                empty={
                  <EmptyState>
                    No vernacular names linked to this taxon name yet.
                  </EmptyState>
                }
              >
                <DataTable rowClick={false} bulkActionButtons={false}>
                  <DataTable.Col source="vernacular_name" label="Name" />
                  <DataTable.Col source="language" label="Language" />
                  <DataTable.Col label="Preferred language">
                    <RecordField
                      label=""
                      render={(vernacular: { lang_pref?: boolean | null }) =>
                        renderBoolean(vernacular.lang_pref)
                      }
                    />
                  </DataTable.Col>
                  <DataTable.Col label="Preferred">
                    <RecordField
                      label=""
                      render={(vernacular: { preferred?: boolean | null }) =>
                        renderBoolean(vernacular.preferred)
                      }
                    />
                  </DataTable.Col>
                  <DataTable.Col source="sort_order" label="Sort order" />
                </DataTable>
              </ReferenceManyField>
            ) : null}
          </section>
        ) : null}

        {visibleSections.has('hierarchy') ? (
          <section className="mt-12 space-y-4 border-t border-border pt-12">
            <SectionHeader
              title="Hierarchy"
              description="Hierarchical classifications linked to this taxon name."
              action={
                editable && recordId ? (
                  <CreateInDialogButton
                    resource="hierarchies"
                    record={{ taxon_name_id: recordId }}
                    fullWidth
                    maxWidth="md"
                    title="Create hierarchy row"
                    label="Create hierarchy row"
                    ButtonProps={relatedDialogButtonProps}
                  >
                    <DialogFormPadding>
                      <HierarchyForm hideTaxonName />
                    </DialogFormPadding>
                  </CreateInDialogButton>
                ) : undefined
              }
            />
            {editable ? (
              recordId ? (
                <ReferenceManyField
                  reference="hierarchies"
                  target="taxon_name_id"
                  sort={{ field: 'path', order: 'ASC' }}
                  empty={
                    <EmptyState>
                      No hierarchy rows linked to this taxon name yet.
                    </EmptyState>
                  }
                >
                  <DataTable bulkActionButtons={false}>
                    <DataTable.Col label="Classification system">
                      <ReferenceField
                        source="classification_system_id"
                        reference="classification_systems"
                        link="show"
                      >
                        <RecordField source="class_desc" label="" />
                      </ReferenceField>
                    </DataTable.Col>
                    <DataTable.Col label="Parent name">
                      <ReferenceField
                        source="parent_nid"
                        reference="taxon_names"
                        link="show"
                      >
                        <RecordField
                          label=""
                          render={(taxon: {
                            formatted_scientific_name?: string | null;
                          }) => (
                            <HtmlValue
                              value={taxon.formatted_scientific_name}
                            />
                          )}
                        />
                      </ReferenceField>
                    </DataTable.Col>
                    <DataTable.Col label="Actions">
                      <div className="flex items-center gap-2">
                        <EditRelatedButton label="Edit hierarchy row">
                          <DialogFormPadding>
                            <HierarchyForm hideTaxonName />
                          </DialogFormPadding>
                        </EditRelatedButton>
                        <DeleteRelatedButton resource="hierarchies" />
                      </div>
                    </DataTable.Col>
                  </DataTable>
                </ReferenceManyField>
              ) : (
                <EmptyState>
                  Save the taxon name first, then you can add hierarchy rows
                  inline here.
                </EmptyState>
              )
            ) : recordId ? (
              <ReferenceManyField
                reference="hierarchies"
                target="taxon_name_id"
                sort={{ field: 'path', order: 'ASC' }}
                empty={
                  <EmptyState>
                    No hierarchy rows linked to this taxon name yet.
                  </EmptyState>
                }
              >
                <DataTable rowClick={false} bulkActionButtons={false}>
                  <DataTable.Col label="Classification system">
                    <ReferenceField
                      source="classification_system_id"
                      reference="classification_systems"
                      link={false}
                    >
                      <RecordField source="class_desc" label="" />
                    </ReferenceField>
                  </DataTable.Col>
                  <DataTable.Col label="Parent name">
                    <ReferenceField
                      source="parent_nid"
                      reference="taxon_names"
                      link={false}
                    >
                      <RecordField
                        label=""
                        render={(taxon: {
                          formatted_scientific_name?: string | null;
                        }) => (
                          <HtmlValue value={taxon.formatted_scientific_name} />
                        )}
                      />
                    </ReferenceField>
                  </DataTable.Col>
                </DataTable>
              </ReferenceManyField>
            ) : null}
          </section>
        ) : null}

        {visibleSections.has('relatedNames') ? (
          <section className="mt-12 space-y-4 border-t border-border pt-12">
            <SectionHeader
              title="Related names"
              description="Cross references where this taxon is the old or new name."
              action={undefined}
            />
            {recordId ? (
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-3">
                  <SectionHeader
                    title="Previous names"
                    action={
                      editable ? (
                        <CreateInDialogButton
                          resource="cross_references"
                          record={{ new_name_id: recordId }}
                          fullWidth
                          maxWidth="md"
                          title="Create previous name"
                          label="Create cross reference"
                          ButtonProps={relatedDialogButtonProps}
                        >
                          <DialogFormPadding>
                            <CrossReferenceForm hideNewName />
                          </DialogFormPadding>
                        </CreateInDialogButton>
                      ) : undefined
                    }
                  />
                  <ReferenceManyField
                    reference="cross_references"
                    target="new_name_id"
                    empty={
                      <EmptyState>No previous names linked yet.</EmptyState>
                    }
                    error={<RelatedFetchError resourceLabel="previous names" />}
                  >
                    <RelatedNameCards
                      nameSource="old_name_id"
                      directionLabel="Previous name"
                      editable={editable}
                      showOpenAction={!editable}
                    />
                  </ReferenceManyField>
                </div>
                <div className="space-y-3">
                  <SectionHeader
                    title="Subsequent names"
                    action={
                      editable ? (
                        <CreateInDialogButton
                          resource="cross_references"
                          record={{ old_name_id: recordId }}
                          fullWidth
                          maxWidth="md"
                          title="Create subsequent name"
                          label="Create cross reference"
                          ButtonProps={relatedDialogButtonProps}
                        >
                          <DialogFormPadding>
                            <CrossReferenceForm hideOldName />
                          </DialogFormPadding>
                        </CreateInDialogButton>
                      ) : undefined
                    }
                  />
                  <ReferenceManyField
                    reference="cross_references"
                    target="old_name_id"
                    empty={
                      <EmptyState>No subsequent names linked yet.</EmptyState>
                    }
                    error={
                      <RelatedFetchError resourceLabel="subsequent names" />
                    }
                  >
                    <RelatedNameCards
                      nameSource="new_name_id"
                      directionLabel="Subsequent name"
                      editable={editable}
                      showOpenAction={!editable}
                    />
                  </ReferenceManyField>
                </div>
              </div>
            ) : (
              <EmptyState>
                Save the taxon name first, then you can add related names
                inline here.
              </EmptyState>
            )}
          </section>
        ) : null}

        {visibleSections.has('conservationCodes') ? (
          <section className="mt-12 space-y-4 border-t border-border pt-12">
            <SectionHeader
              title="Conservation codes"
              description="Linked conservation-code records for this taxon name."
              action={
                editable && recordId ? (
                  <CreateInDialogButton
                    resource="conscode_taxons"
                    record={{ taxon_name_id: recordId }}
                    fullWidth
                    maxWidth="md"
                    title="Create conservation code"
                    label="+ Create conservation code"
                    ButtonProps={relatedDialogButtonProps}
                  >
                    <DialogFormPadding>
                      <ConscodeTaxonForm />
                    </DialogFormPadding>
                  </CreateInDialogButton>
                ) : undefined
              }
            />
            {recordId ? (
              <ReferenceManyField
                reference="conscode_taxons"
                target="taxon_name_id"
                sort={{ field: 'effective_from', order: 'DESC' }}
                empty={
                  <EmptyState>
                    No conservation codes linked to this taxon name yet.
                  </EmptyState>
                }
              >
                <DataTable rowClick={false} bulkActionButtons={false}>
                  <DataTable.Col label="Authority">
                    <ReferenceField
                      source="conservation_code_id"
                      reference="conservation_codes"
                      link={false}
                    >
                      <RecordField source="authorising_org" label="" />
                    </ReferenceField>
                  </DataTable.Col>
                  <DataTable.Col label="Conservation code">
                    <ReferenceField
                      source="conservation_code_id"
                      reference="conservation_codes"
                      link={false}
                    >
                      <RecordField source="conservation_code_value" label="" />
                    </ReferenceField>
                  </DataTable.Col>
                  <DataTable.Col
                    source="effective_from"
                    label="Effective from"
                    field={DateField}
                  />
                  <DataTable.Col
                    source="effective_to"
                    label="Effective to"
                    field={DateField}
                  />
                  {editable ? (
                    <DataTable.Col label="">
                      <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                          <EditRelatedButton label="Edit conservation code">
                            <DialogFormPadding>
                              <ConscodeTaxonForm />
                            </DialogFormPadding>
                          </EditRelatedButton>
                          <OpenConservationCodeRelatedButton />
                        </div>
                      </div>
                    </DataTable.Col>
                  ) : null}
                </DataTable>
              </ReferenceManyField>
            ) : null}
          </section>
        ) : null}
      </div>
    </EnterpriseDialogThemeProvider>
  );
};

export default TaxonNameRelatedSections;
