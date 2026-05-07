import * as React from 'react';
import { CreateInDialogButton, EditInDialogButton } from '@react-admin/ra-form-layout';
import { ThemeProvider, createTheme } from '@mui/material';
import { useRecordContext } from 'ra-core';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/admin/data-table';
import { DateField } from '@/components/admin/date-field';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { ReferenceManyField } from '@/components/admin/reference-many-field';
import { Button } from '@/components/ui/button';
import TaxonNameTitle from '../taxon-names/TaxonNameTitle';
import PublicationStatus from '../shared/choices/PublicationStatus';
import ConscodeTaxonForm from '../conscode-taxons/ConscodeTaxonForm';

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const renderBoolean = (value?: boolean | null) => {
  if (value == null) {
    return '';
  }

  return value ? 'Yes' : 'No';
};

const renderChoice = (
  choices: Array<{ id: string; name: string }>,
  value?: string | null
) => {
  if (!value) {
    return '';
  }

  return choices.find((choice) => choice.id === value)?.name ?? value;
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

  const muiTheme = React.useMemo(() => {
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
  }, [isDark]);

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

const DialogFormPadding = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-2 sm:px-6">{children}</div>
);

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

const AddConservationCodeButton = () => {
  const record = useRecordContext<{ id?: string | number }>();
  if (record?.id == null) {
    return null;
  }

  return (
    <CreateInDialogButton
      resource="conscode_taxons"
      record={{ taxon_name_id: record.id }}
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
  );
};

const OpenConservationCodeButton = () => {
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

export const TaxonNameCodeTitle = () => {
  return <TaxonNameTitle fallback="Taxon name conservation codes" />;
};

export const TaxonNameCodeDetails = ({ editable = false }: { editable?: boolean }) => (
  <EnterpriseDialogThemeProvider>
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-6">
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">Taxon name summary</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RecordField
          label="NomosID"
          className="xl:col-span-1"
          render={(record: { id?: string | number | null; taxon_name_id?: string | number | null }) =>
            record.taxon_name_id ?? record.id ?? ''
          }
        />
        <RecordField
          label="Formatted scientific name"
          className="md:col-span-1 xl:col-span-3"
          render={(record: { formatted_scientific_name?: string | null }) => (
            <HtmlValue value={record.formatted_scientific_name} />
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RecordField label="Kingdom" source="kingdom_id">
          <ReferenceField source="kingdom_id" reference="kingdoms" link="show">
            <RecordField source="kingdom_name" label="" />
          </ReferenceField>
        </RecordField>
        <RecordField label="Rank" source="taxon_rank_id">
          <ReferenceField source="taxon_rank_id" reference="taxon_ranks" link="show">
            <RecordField source="rank_name" label="" />
          </ReferenceField>
        </RecordField>
        <div className="hidden md:block md:col-span-2 xl:col-span-4" aria-hidden="true" />
        <RecordField source="publication_status" label="Publication status">
          <RecordField
            label=""
            render={(record: { publication_status?: string | null }) =>
              renderChoice(PublicationStatus, record.publication_status)
            }
          />
        </RecordField>
        <RecordField
          label="Current"
          render={(record: { is_current?: boolean | null }) => renderBoolean(record.is_current)}
        />
        <RecordField
          label="Validated"
          render={(record: { validated?: boolean | null }) => renderBoolean(record.validated)}
        />
        <div className="hidden md:block md:col-span-1 xl:col-span-4" aria-hidden="true" />
        <RecordField source="legacy_id" label="Legacy ID" className="xl:col-span-4" />
      </div>
    </section>

    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Conservation codes</h3>
          <p className="text-sm text-muted-foreground">
            Related conservation-code records for this taxon name.
          </p>
        </div>
        {editable ? <AddConservationCodeButton /> : null}
      </div>

      <ReferenceManyField
        reference="conscode_taxons"
        target="taxon_name_id"
        perPage={200}
        sort={{ field: 'effective_from', order: 'DESC' }}
        empty={
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No conservation codes linked to this taxon name yet.
          </div>
        }
      >
        <DataTable rowClick={false} bulkActionButtons={false}>
          <DataTable.Col label="Authority">
            <ReferenceField source="conservation_code_id" reference="conservation_codes" link="show">
              <RecordField source="authorising_org" label="" />
            </ReferenceField>
          </DataTable.Col>
          <DataTable.Col label="Conservation code">
            <ReferenceField source="conservation_code_id" reference="conservation_codes" link="show">
              <RecordField source="conservation_code_value" label="" />
            </ReferenceField>
          </DataTable.Col>
          <DataTable.Col source="effective_from" label="Effective from" field={DateField} />
          <DataTable.Col source="effective_to" label="Effective to" field={DateField} />
          <DataTable.Col label="">
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                {editable ? (
                  <EditRelatedButton label="Edit conservation code">
                    <DialogFormPadding>
                      <ConscodeTaxonForm />
                    </DialogFormPadding>
                  </EditRelatedButton>
                ) : null}
                <OpenConservationCodeButton />
              </div>
            </div>
          </DataTable.Col>
        </DataTable>
      </ReferenceManyField>
    </div>
    </div>
  </EnterpriseDialogThemeProvider>
);
