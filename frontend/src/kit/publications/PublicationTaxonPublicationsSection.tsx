import * as React from 'react';
import {
  useCanAccess,
  useRecordContext,
} from 'ra-core';
import {
  CreateInDialogButton,
  EditInDialogButton,
} from '@react-admin/ra-form-layout';
import { ThemeProvider, createTheme } from '@mui/material';
import { DataTable } from '@/components/admin/data-table';
import { DeleteButton } from '@/components/admin/delete-button';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { ReferenceManyField } from '@/components/admin/reference-many-field';
import TaxonPublicationForm from '../taxon-publications/TaxonPublicationForm';

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

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) {
    return null;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const LinkedTaxonCell = ({ clickable }: { clickable: boolean }) => (
  <ReferenceField
    source="taxon_name_id"
    reference="taxon_names"
    link={clickable ? 'show' : false}
  >
    <RecordField
      label=""
      render={(taxon: {
        formatted_scientific_name?: string | null;
        scientific_name?: string | null;
      }) =>
        taxon?.formatted_scientific_name ? (
          <HtmlValue value={taxon.formatted_scientific_name} />
        ) : (
          taxon?.scientific_name ?? ''
        )
      }
    />
  </ReferenceField>
);

type PublicationTaxonPublicationsSectionProps = {
  editable?: boolean;
};

const PublicationTaxonPublicationsSection = ({
  editable = false,
}: PublicationTaxonPublicationsSectionProps) => {
  const record = useRecordContext<{ id?: string | number; publication_id?: string | number }>();
  const publicationId = record?.id ?? record?.publication_id;

  return (
    <EnterpriseDialogThemeProvider>
      <section className="mt-12 space-y-4 border-t border-border pt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">Linked taxon references</h3>
            <p className="text-sm text-muted-foreground">
              Taxon links using this publication, including page, figure, and notes metadata.
            </p>
          </div>
          {editable && publicationId ? (
            <CreateInDialogButton
              resource="taxon-publications"
              record={{ publication_id: publicationId }}
              fullWidth
              maxWidth="md"
              title="Create taxon publication link"
              label="Create taxon publication link"
              ButtonProps={relatedDialogButtonProps}
            >
              <DialogFormPadding>
                <TaxonPublicationForm hidePublication />
              </DialogFormPadding>
            </CreateInDialogButton>
          ) : null}
        </div>
 
        {publicationId ? (
          <ReferenceManyField
            reference="taxon-publications"
            target="publication_id"
            sort={{ field: 'taxon_publication_id', order: 'ASC' }}
            empty={
              <EmptyState>
                No taxon links are using this publication yet.
              </EmptyState>
            }
          >
            <DataTable rowClick={false} bulkActionButtons={false}>
              <DataTable.Col label="Taxon name">
                <LinkedTaxonCell clickable={!editable} />
              </DataTable.Col>
              <DataTable.Col source="page_reference" label="Page reference" />
              <DataTable.Col source="figure_reference" label="Figure reference" />
              <DataTable.Col source="notes" label="Notes" />
              {editable ? (
                <DataTable.Col label="Actions">
                  <div className="flex items-center gap-2">
                    <EditRelatedButton label="Edit taxon publication link">
                      <DialogFormPadding>
                        <TaxonPublicationForm hidePublication />
                      </DialogFormPadding>
                    </EditRelatedButton>
                    <DeleteRelatedButton resource="taxon-publications" />
                  </div>
                </DataTable.Col>
              ) : null}
            </DataTable>
          </ReferenceManyField>
        ) : (
          <EmptyState>
            Save the publication first, then you can add linked taxon references
            inline here.
          </EmptyState>
        )}
      </section>
    </EnterpriseDialogThemeProvider>
  );
};

export default PublicationTaxonPublicationsSection;
