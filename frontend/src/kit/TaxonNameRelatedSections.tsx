import * as React from 'react';
import { useCanAccess, useGetOne, useRecordContext } from 'ra-core';
import { useFormContext } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { CreateInDialogButton, EditInDialogButton } from '@react-admin/ra-form-layout';
import { ThemeProvider, createTheme } from '@mui/material';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { DeleteButton } from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/data-table';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceInput } from '@/components/admin/reference-input';
import { ReferenceArrayField } from '@/components/admin/reference-array-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { ReferenceManyField } from '@/components/admin/reference-many-field';
import { SingleFieldList } from '@/components/admin/single-field-list';
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
} from 'react-admin';
import CrossRefType from '../admin/Cross_references/CrossRefType';
import NaturalisedStatus from '../admin/Taxon_names/NaturalisedStatus';
import PublicationStatus from '../admin/Taxon_names/PublicationStatus';
import CitationForm from './CitationForm';
import CrossReferenceForm from './CrossReferenceForm';
import HierarchyForm from './HierarchyForm';
import PublicationForm from './PublicationForm';
import { normalizeDoi, transformPublicationPayload } from './publicationDoi';
import VernacularForm from './VernacularForm';

const crossRefTypeMap = CrossRefType.reduce<Record<string, string>>((acc, item) => {
  acc[item.id] = item.name;
  return acc;
}, {});

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const renderBoolean = (value?: boolean | null) => {
  if (value == null) return '';
  return value ? 'Yes' : 'No';
};

const renderChoice = (choices: Array<{ id: string; name: string }>, value?: string | null) => {
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
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
    {action}
  </div>
);

const TaxonNameCodeButton = () => {
  const record = useRecordContext<{ id?: string | number }>();
  if (record?.id == null) return null;

  return (
    <Button asChild variant="outline">
      <Link to={`/taxon_names_code/${record.id}`}>Open conservation code page</Link>
    </Button>
  );
};

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
    {children}
  </div>
);

const RelatedFetchError = ({
  resourceLabel,
}: {
  resourceLabel: string;
}) => (
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

const EnterpriseDialogThemeProvider = ({ children }: { children: React.ReactNode }) => {
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

  const muiTheme = React.useMemo(
    () => {
      const styles = getComputedStyle(document.documentElement);
      const background = styles.getPropertyValue('--background').trim();
      const foreground = styles.getPropertyValue('--foreground').trim();
      const card = styles.getPropertyValue('--card').trim();
      const cardForeground = styles.getPropertyValue('--card-foreground').trim();
      const border = styles.getPropertyValue('--border').trim();
      const primary = styles.getPropertyValue('--primary').trim();
      const primaryForeground = styles.getPropertyValue('--primary-foreground').trim();

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
    },
    [isDark]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      {children}
    </ThemeProvider>
  );
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
  label = 'Edit',
}: {
  children: React.ReactNode;
  label?: string;
}) => (
  <EditInDialogButton
    fullWidth
    maxWidth="md"
    mutationMode="pessimistic"
    title={label}
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
          perPage={100}
          className="w-full"
        >
          <AutocompleteInput optionText="display_title" label="Publication" />
        </ReferenceInput>
        {publicationId ? (
          <Button asChild variant="outline">
            <Link to={`/publications/${publicationId}/show`}>Open publication</Link>
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
        <EmptyState>Select or create a publication to link it to this taxon name.</EmptyState>
      )}
    </div>
  );
};

const PublicationReadOnlySection = () => {
  const record = useRecordContext<{ publication_id?: string | number | null }>();
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

const CreatePublicationButton = () => {
  const form = useFormContext();

  return (
    <CreateInDialogButton
      resource="publications"
      fullWidth
      maxWidth="lg"
      mutationMode="pessimistic"
      transform={transformPublicationPayload}
      title="Create publication"
      label="Create publication"
      mutationOptions={{
        onSuccess: (data: { id?: string | number; publication_id?: string | number }) => {
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
      mutationMode="pessimistic"
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
  | 'authors'
  | 'publication'
  | 'vernaculars'
  | 'hierarchy'
  | 'relatedNames'
  | 'conservationCodes';

type TaxonNameRelatedSectionsProps = {
  editable?: boolean;
  embedded?: boolean;
  sections?: RelatedSectionKey[];
};

const TaxonNameRelatedSections = ({
  editable = false,
  embedded = false,
  sections,
}: TaxonNameRelatedSectionsProps) => {
  const record = useRecordContext<{ id?: string | number }>();
  const recordId = record?.id;
  const navigate = useNavigate();
  const visibleSections = new Set<RelatedSectionKey>(
    sections ?? ['authors', 'publication', 'vernaculars', 'hierarchy', 'relatedNames', 'conservationCodes']
  );

  return (
    <EnterpriseDialogThemeProvider>
      <div
        className={
          embedded
            ? 'space-y-0'
            : 'space-y-0 rounded-2xl border border-border bg-card p-6'
        }
      >
        {!editable ? (
          <>
            <section className="space-y-4">
              <SectionHeader title="Taxon name summary" />
              <div className="space-y-2">
                <RecordField
                  label="Formatted scientific name"
                  render={(taxon: { formatted_scientific_name?: string | null }) => (
                    <HtmlValue value={taxon.formatted_scientific_name} />
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <RecordField label="Kingdom" source="kingdom_id">
                  <ReferenceField source="kingdom_id" reference="kingdoms" link={false}>
                    <RecordField
                      source="kingdom_name"
                      label=""
                      render={(kingdom: { kingdom_name?: string | null; id?: string | number | null }) => (
                        <span
                          className="cursor-default"
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
                  <ReferenceField source="rank_id" reference="taxon_ranks" link={false}>
                    <RecordField
                      source="rank_name"
                      label=""
                      render={(rank: { rank_name?: string | null; id?: string | number | null }) => (
                        <span
                          className="cursor-default"
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
                <RecordField source="publication_status" label="Publication status">
                  <RecordField
                    label=""
                    render={(taxon: { publication_status?: string | null }) =>
                      renderChoice(PublicationStatus, taxon.publication_status)
                    }
                  />
                </RecordField>
                <RecordField label="Current" render={(taxon: { is_current?: boolean | null }) => renderBoolean(taxon.is_current)} />
                <RecordField label="Validated" render={(taxon: { validated?: boolean | null }) => renderBoolean(taxon.validated)} />
                <RecordField label="Review" render={(taxon: { review?: boolean | null }) => renderBoolean(taxon.review)} />
                <RecordField source="review_reason" label="Review reason" className="xl:col-span-2" />
                <RecordField
                  label="NomosID"
                  render={(taxon: { id?: string | number | null; taxon_name_id?: string | number | null }) =>
                    taxon.taxon_name_id ?? taxon.id ?? ''
                  }
                />
                <RecordField source="legacy_id" label="Legacy ID" />
                <RecordField source="comments" label="Comments" className="xl:col-span-4" />
              </div>
            </section>

            <section className="mt-12 space-y-4 border-t border-border pt-12">
              <SectionHeader title="Details" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <RecordField source="naturalised_status" label="Naturalised status">
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
                <RecordField source="naturalised_comments" label="Naturalised comments" className="xl:col-span-4" />
                <RecordField label="Informal groups" className="xl:col-span-4">
                  <ReferenceArrayField reference="classification_systems" source="classification_system_ids">
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
                mutationMode="pessimistic"
                title="Create citation"
                label="Create citation"
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
            <ReferenceManyField
              reference="citations"
              target="taxon_name_id"
              sort={{ field: 'author_order', order: 'ASC' }}
              empty={<EmptyState>No citations linked to this taxon name yet.</EmptyState>}
            >
              <DataTable bulkActionButtons={false}>
                <DataTable.Col label="Author">
                  <ReferenceField source="author_id" reference="authors" link="show">
                    <RecordField source="abbreviation" label="" />
                  </ReferenceField>
                </DataTable.Col>
                <DataTable.Col source="author_type" label="Author type" />
                <DataTable.Col source="author_order" label="Order" />
                <DataTable.Col label="Actions">
                  <div className="flex items-center gap-2">
                    <EditRelatedButton label="Edit citation">
                      <DialogFormPadding>
                        <CitationForm hideTaxonName />
                      </DialogFormPadding>
                    </EditRelatedButton>
                    <DeleteRelatedButton resource="citations" />
                  </div>
                </DataTable.Col>
              </DataTable>
            </ReferenceManyField>
          ) : (
            <EmptyState>Save the taxon name first, then you can add citations inline here.</EmptyState>
          )
        ) : recordId ? (
          <ReferenceManyField
            reference="citations"
            target="taxon_name_id"
            sort={{ field: 'author_order', order: 'ASC' }}
            empty={<EmptyState>No citations linked to this taxon name yet.</EmptyState>}
          >
            <DataTable rowClick={false} bulkActionButtons={false}>
              <DataTable.Col label="Author">
                <ReferenceField source="author_id" reference="authors" link={false}>
                  <RecordField source="abbreviation" label="" />
                </ReferenceField>
              </DataTable.Col>
              <DataTable.Col source="author_type" label="Author type" />
              <DataTable.Col source="author_order" label="Order" />
            </DataTable>
          </ReferenceManyField>
        ) : null}
        </section>
        ) : null}

        {visibleSections.has('publication') ? (
        <section className="mt-12 space-y-4 border-t border-border pt-12">
        <SectionHeader
          title="Publication"
          description="Linked publication for this taxon name."
          action={
            editable ? (
              <CreatePublicationButton />
            ) : undefined
          }
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
                mutationMode="pessimistic"
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
              empty={<EmptyState>No vernacular names linked to this taxon name yet.</EmptyState>}
            >
              <DataTable bulkActionButtons={false}>
                <DataTable.Col source="vernacular_name" label="Name" />
                <DataTable.Col source="language" label="Language" />
                <DataTable.Col label="Preferred language">
                  <RecordField
                    label=""
                    render={(vernacular: { lang_pref?: boolean | null }) => renderBoolean(vernacular.lang_pref)}
                  />
                </DataTable.Col>
                <DataTable.Col label="Preferred">
                  <RecordField
                    label=""
                    render={(vernacular: { preferred?: boolean | null }) => renderBoolean(vernacular.preferred)}
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
            <EmptyState>Save the taxon name first, then you can add vernacular names inline here.</EmptyState>
          )
        ) : recordId ? (
          <ReferenceManyField
            reference="vernaculars"
            target="taxon_name_id"
            sort={{ field: 'sort_order', order: 'ASC' }}
            empty={<EmptyState>No vernacular names linked to this taxon name yet.</EmptyState>}
          >
            <DataTable rowClick={false} bulkActionButtons={false}>
              <DataTable.Col source="vernacular_name" label="Name" />
              <DataTable.Col source="language" label="Language" />
              <DataTable.Col label="Preferred language">
                <RecordField
                  label=""
                  render={(vernacular: { lang_pref?: boolean | null }) => renderBoolean(vernacular.lang_pref)}
                />
              </DataTable.Col>
              <DataTable.Col label="Preferred">
                <RecordField
                  label=""
                  render={(vernacular: { preferred?: boolean | null }) => renderBoolean(vernacular.preferred)}
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
                mutationMode="pessimistic"
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
              empty={<EmptyState>No hierarchy rows linked to this taxon name yet.</EmptyState>}
            >
              <DataTable bulkActionButtons={false}>
                <DataTable.Col label="Classification system">
                  <ReferenceField source="classification_system_id" reference="classification_systems" link="show">
                    <RecordField source="class_desc" label="" />
                  </ReferenceField>
                </DataTable.Col>
                <DataTable.Col label="Parent name">
                  <ReferenceField source="parent_nid" reference="taxon_names" link="show">
                    <RecordField
                      label=""
                      render={(taxon: { formatted_scientific_name?: string | null }) => (
                        <HtmlValue value={taxon.formatted_scientific_name} />
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
            <EmptyState>Save the taxon name first, then you can add hierarchy rows inline here.</EmptyState>
          )
        ) : recordId ? (
          <ReferenceManyField
            reference="hierarchies"
            target="taxon_name_id"
            sort={{ field: 'path', order: 'ASC' }}
            empty={<EmptyState>No hierarchy rows linked to this taxon name yet.</EmptyState>}
          >
            <DataTable rowClick={false} bulkActionButtons={false}>
              <DataTable.Col label="Classification system">
                <ReferenceField source="classification_system_id" reference="classification_systems" link={false}>
                  <RecordField source="class_desc" label="" />
                </ReferenceField>
              </DataTable.Col>
              <DataTable.Col label="Parent name">
                <ReferenceField source="parent_nid" reference="taxon_names" link={false}>
                  <RecordField
                    label=""
                    render={(taxon: { formatted_scientific_name?: string | null }) => (
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
        {editable ? (
          recordId ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-3">
                <SectionHeader
                  title="Previous names"
                  action={
                    <CreateInDialogButton
                      resource="cross_references"
                      record={{ new_name_id: recordId }}
                      fullWidth
                      maxWidth="md"
                      mutationMode="pessimistic"
                      title="Create previous name"
                      label="Create previous name"
                      ButtonProps={relatedDialogButtonProps}
                    >
                      <DialogFormPadding>
                        <CrossReferenceForm hideNewName />
                      </DialogFormPadding>
                    </CreateInDialogButton>
                  }
                />
                <ReferenceManyField
                  reference="cross_references"
                  target="new_name_id"
                  empty={<EmptyState>No previous names linked yet.</EmptyState>}
                  error={<RelatedFetchError resourceLabel="previous names" />}
                >
                  <DataTable bulkActionButtons={false}>
                    <DataTable.Col source="cross_reference_type" label="Type">
                      <RecordField
                        label=""
                        render={(crossRef: { cross_reference_type?: string | null }) =>
                          crossRef.cross_reference_type
                            ? crossRefTypeMap[crossRef.cross_reference_type] ?? crossRef.cross_reference_type
                            : ''
                        }
                      />
                    </DataTable.Col>
                    <DataTable.Col label="Old name">
                      <ReferenceField source="old_name_id" reference="taxon_names" link="show">
                        <RecordField
                          label=""
                          render={(taxon: { formatted_scientific_name?: string | null }) => (
                            <HtmlValue value={taxon.formatted_scientific_name} />
                          )}
                        />
                      </ReferenceField>
                    </DataTable.Col>
                    <DataTable.Col source="reference_comments" label="Comments" />
                    <DataTable.Col label="Actions">
                      <div className="flex items-center gap-2">
                        <EditRelatedButton label="Edit previous name">
                          <DialogFormPadding>
                            <CrossReferenceForm hideNewName />
                          </DialogFormPadding>
                        </EditRelatedButton>
                        <DeleteRelatedButton resource="cross_references" />
                      </div>
                    </DataTable.Col>
                  </DataTable>
                </ReferenceManyField>
              </div>
              <div className="space-y-3">
                <SectionHeader
                  title="Subsequent names"
                  action={
                    <CreateInDialogButton
                      resource="cross_references"
                      record={{ old_name_id: recordId }}
                      fullWidth
                      maxWidth="md"
                      mutationMode="pessimistic"
                      title="Create subsequent name"
                      label="Create subsequent name"
                      ButtonProps={relatedDialogButtonProps}
                    >
                      <DialogFormPadding>
                        <CrossReferenceForm hideOldName />
                      </DialogFormPadding>
                    </CreateInDialogButton>
                  }
                />
                <ReferenceManyField
                  reference="cross_references"
                  target="old_name_id"
                  empty={<EmptyState>No subsequent names linked yet.</EmptyState>}
                  error={<RelatedFetchError resourceLabel="subsequent names" />}
                >
                  <DataTable bulkActionButtons={false}>
                    <DataTable.Col source="cross_reference_type" label="Type">
                      <RecordField
                        label=""
                        render={(crossRef: { cross_reference_type?: string | null }) =>
                          crossRef.cross_reference_type
                            ? crossRefTypeMap[crossRef.cross_reference_type] ?? crossRef.cross_reference_type
                            : ''
                        }
                      />
                    </DataTable.Col>
                    <DataTable.Col label="New name">
                      <ReferenceField source="new_name_id" reference="taxon_names" link="show">
                        <RecordField
                          label=""
                          render={(taxon: { formatted_scientific_name?: string | null }) => (
                            <HtmlValue value={taxon.formatted_scientific_name} />
                          )}
                        />
                      </ReferenceField>
                    </DataTable.Col>
                    <DataTable.Col source="reference_comments" label="Comments" />
                    <DataTable.Col label="Actions">
                      <div className="flex items-center gap-2">
                        <EditRelatedButton label="Edit subsequent name">
                          <DialogFormPadding>
                            <CrossReferenceForm hideOldName />
                          </DialogFormPadding>
                        </EditRelatedButton>
                        <DeleteRelatedButton resource="cross_references" />
                      </div>
                    </DataTable.Col>
                  </DataTable>
                </ReferenceManyField>
              </div>
            </div>
          ) : (
            <EmptyState>Save the taxon name first, then you can add related names inline here.</EmptyState>
          )
        ) : recordId ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Previous names</h4>
              <ReferenceManyField
                reference="cross_references"
                target="new_name_id"
                empty={<EmptyState>No previous names linked yet.</EmptyState>}
                error={<RelatedFetchError resourceLabel="previous names" />}
              >
                <DataTable rowClick="show" bulkActionButtons={false}>
                  <DataTable.Col source="cross_reference_type" label="Type">
                    <RecordField
                      label=""
                      render={(crossRef: { cross_reference_type?: string | null }) =>
                        crossRef.cross_reference_type
                          ? crossRefTypeMap[crossRef.cross_reference_type] ?? crossRef.cross_reference_type
                          : ''
                      }
                    />
                  </DataTable.Col>
                  <DataTable.Col label="Old name">
                    <ReferenceField source="old_name_id" reference="taxon_names" link="show">
                      <RecordField
                        label=""
                        render={(taxon: { formatted_scientific_name?: string | null }) => (
                          <HtmlValue value={taxon.formatted_scientific_name} />
                        )}
                      />
                    </ReferenceField>
                  </DataTable.Col>
                  <DataTable.Col source="reference_comments" label="Comments" />
                </DataTable>
              </ReferenceManyField>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Subsequent names</h4>
              <ReferenceManyField
                reference="cross_references"
                target="old_name_id"
                empty={<EmptyState>No subsequent names linked yet.</EmptyState>}
                error={<RelatedFetchError resourceLabel="subsequent names" />}
              >
                <DataTable rowClick="show" bulkActionButtons={false}>
                  <DataTable.Col source="cross_reference_type" label="Type">
                    <RecordField
                      label=""
                      render={(crossRef: { cross_reference_type?: string | null }) =>
                        crossRef.cross_reference_type
                          ? crossRefTypeMap[crossRef.cross_reference_type] ?? crossRef.cross_reference_type
                          : ''
                      }
                    />
                  </DataTable.Col>
                  <DataTable.Col label="New name">
                    <ReferenceField source="new_name_id" reference="taxon_names" link="show">
                      <RecordField
                        label=""
                        render={(taxon: { formatted_scientific_name?: string | null }) => (
                          <HtmlValue value={taxon.formatted_scientific_name} />
                        )}
                      />
                    </ReferenceField>
                  </DataTable.Col>
                  <DataTable.Col source="reference_comments" label="Comments" />
                </DataTable>
              </ReferenceManyField>
            </div>
          </div>
        ) : null}
        </section>
        ) : null}

        {visibleSections.has('conservationCodes') ? (
        <section className="mt-12 space-y-4 border-t border-border pt-12">
        <SectionHeader
          title="Conservation codes"
          description="Linked conservation-code records for this taxon name."
          action={<TaxonNameCodeButton />}
        />
        {recordId ? (
          <ReferenceManyField
            reference="conscode_taxons"
            target="taxon_name_id"
            sort={{ field: 'effective_from', order: 'DESC' }}
            empty={<EmptyState>No conservation codes linked to this taxon name yet.</EmptyState>}
          >
            <DataTable rowClick={false} bulkActionButtons={false}>
              <DataTable.Col label="Authority">
                <ReferenceField source="conservation_code_id" reference="conservation_codes" link={false}>
                  <RecordField source="authorising_org" label="" />
                </ReferenceField>
              </DataTable.Col>
              <DataTable.Col label="Conservation code">
                <ReferenceField source="conservation_code_id" reference="conservation_codes" link={false}>
                  <RecordField source="conservation_code_value" label="" />
                </ReferenceField>
              </DataTable.Col>
              <DataTable.Col source="effective_from" label="Effective from" field={DateField} />
              <DataTable.Col source="effective_to" label="Effective to" field={DateField} />
              <DataTable.Col source="notes" label="Notes" />
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
