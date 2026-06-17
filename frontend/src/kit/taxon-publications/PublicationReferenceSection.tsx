import * as React from 'react';
import { CreateInDialogButton, EditInDialogButton } from '@react-admin/ra-form-layout';
import { ThemeProvider, createTheme } from '@mui/material';
import {
  RecordContextProvider,
  useCanAccess,
  useListContext,
  useRecordContext,
} from 'ra-core';
import { useGetMany } from 'react-admin';
import { Link } from 'react-router-dom';
import { DeleteButton } from '@/components/admin/delete-button';
import { ReferenceManyField } from '@/components/admin/reference-many-field';
import { normalizeDoi } from '../shared/publicationDoi';
import TaxonPublicationForm from './TaxonPublicationForm';

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

const DialogFormPadding = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-2 sm:px-6">{children}</div>
);

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
    {children}
  </div>
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

const EditRelatedButton = ({ label }: { label: string }) => {
  const record = useRecordContext<{ id?: string | number; taxon_publication_id?: string | number }>();
  const recordId = record?.id ?? record?.taxon_publication_id;

  if (recordId == null) {
    return null;
  }

  return (
    <EditInDialogButton
      id={recordId}
      fullWidth
      maxWidth="md"
      label={label}
      title={label}
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
        <TaxonPublicationForm hideTaxonName hideCrossReference />
      </DialogFormPadding>
    </EditInDialogButton>
  );
};

type PublicationReferenceRecord = {
  id?: string | number;
  taxon_publication_id?: string | number;
  publication_id?: string | number | null;
  page_reference?: string | null;
  figure_reference?: string | null;
  notes?: string | null;
};

export const PublicationReferenceCards = ({ editable }: { editable: boolean }) => {
  const { data = [] } = useListContext<PublicationReferenceRecord>();

  const publicationIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((row) => row.publication_id)
            .filter(
              (value): value is string | number =>
                value !== null && value !== undefined && value !== ''
            )
        )
      ),
    [data]
  );

  const { data: publications = [] } = useGetMany(
    'publications',
    { ids: publicationIds },
    { enabled: publicationIds.length > 0 }
  );

  const publicationMap = React.useMemo(
    () =>
      new Map(
        (Array.isArray(publications) ? publications : []).map((publication) => [
          String(publication.id ?? publication.publication_id ?? ''),
          publication,
        ])
      ),
    [publications]
  );

  return (
    <div className="space-y-3">
      {data.map((row, index) => {
        const rowId = row.id ?? row.taxon_publication_id;
        const publication = publicationMap.get(String(row.publication_id ?? ''));
        const publicationLabel =
          publication?.display_title ??
          publication?.abbreviated_title ??
          (row.publication_id ? `Publication ${row.publication_id}` : 'No publication');
        const publicationDoi =
          typeof publication?.doi === 'string' && publication.doi.trim()
            ? publication.doi
            : null;

        return (
          <RecordContextProvider key={String(rowId ?? `publication-link-${index}`)} value={row}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="space-y-1">
                <div className="space-y-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Publication
                  </div>
                  {row.publication_id ? (
                    <Link
                      to={`/publications/${row.publication_id}/show`}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {publicationLabel}
                    </Link>
                  ) : (
                    <div className="text-sm font-medium text-foreground">
                      {publicationLabel}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Page reference
                  </div>
                  <div className="text-sm text-foreground">
                    {row.page_reference || 'Not set'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Figure reference
                  </div>
                  <div className="text-sm text-foreground">
                    {row.figure_reference || 'Not set'}
                  </div>
                </div>
                {publicationDoi ? (
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      DOI
                    </div>
                    <div className="text-sm text-foreground">
                      <PublicationDoiLink value={publicationDoi} />
                    </div>
                  </div>
                ) : null}
                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Notes
                  </div>
                  <div className="text-sm text-foreground">
                    {row.notes || 'Not set'}
                  </div>
                </div>
              </div>
              {editable ? (
                <div className="-mx-4 -mb-4 mt-4 rounded-b-xl border-t border-border bg-muted/20 px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <EditRelatedButton label="Edit publication reference" />
                    <DeleteRelatedButton resource="taxon-publications" />
                  </div>
                </div>
              ) : null}
            </div>
          </RecordContextProvider>
        );
      })}
    </div>
  );
};

type PublicationReferenceSectionProps = {
  editable?: boolean;
  parentId?: string | number;
  parentField: 'taxon_name_id' | 'cross_reference_id';
  parentLabel: string;
};

const PublicationReferenceSection = ({
  editable = false,
  parentId,
  parentField,
  parentLabel,
}: PublicationReferenceSectionProps) => {
  const createRecord = parentId ? { [parentField]: parentId } : undefined;

  return (
    <EnterpriseDialogThemeProvider>
      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">
              Publication references
            </h3>
            <p className="text-sm text-muted-foreground">
              References for linked publications (page, figure, notes).
            </p>
          </div>
          {editable && parentId ? (
            <CreateInDialogButton
              resource="taxon-publications"
              record={createRecord}
              fullWidth
              maxWidth="md"
              title="Create publication reference"
              label="Create publication reference"
              ButtonProps={relatedDialogButtonProps}
            >
              <DialogFormPadding>
                <TaxonPublicationForm hideTaxonName hideCrossReference />
              </DialogFormPadding>
            </CreateInDialogButton>
          ) : null}
        </div>
        {parentId ? (
          <ReferenceManyField
            reference="taxon-publications"
            target={parentField}
            sort={{ field: 'taxon_publication_id', order: 'ASC' }}
            empty={
              <EmptyState>
                No publication references linked to this {parentLabel} yet.
              </EmptyState>
            }
          >
            <PublicationReferenceCards editable={editable} />
          </ReferenceManyField>
        ) : (
          <EmptyState>
            Save the {parentLabel} first, then you can add publication references
            inline here.
          </EmptyState>
        )}
      </section>
    </EnterpriseDialogThemeProvider>
  );
};

export default PublicationReferenceSection;
