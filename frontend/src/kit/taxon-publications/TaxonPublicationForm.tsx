import * as React from 'react';
import { CreateInDialogButton } from '@react-admin/ra-form-layout';
import { ThemeProvider, createTheme } from '@mui/material';
import { required } from 'ra-core';
import { useFormContext } from 'react-hook-form';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import PublicationForm from '../publications/PublicationForm';
import { getCrossRefTypeLabel } from '../shared/choices/CrossRefType';
import { transformPublicationPayload } from '../shared/publicationDoi';

const requiredValue = required();

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

type TaxonPublicationFormProps = {
  hideTaxonName?: boolean;
  hideCrossReference?: boolean;
  hidePublication?: boolean;
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

const getScientificNameLabel = (
  value?:
    | string
    | null
    | {
        scientific_name?: string | null;
        formatted_scientific_name?: string | null;
      }
) => {
  if (typeof value === 'string') return value;
  return value?.scientific_name ?? value?.formatted_scientific_name ?? '';
};

export const formatCrossReferenceOption = (record?: Record<string, unknown>) => {
  if (!record) return '';

  const typeLabel = getCrossRefTypeLabel(
    record.cross_reference_type as string | null | undefined
  );
  const oldName =
    getScientificNameLabel(record.old_name as Parameters<typeof getScientificNameLabel>[0]) ||
    String(record.old_name___scientific_name ?? '');
  const newName =
    getScientificNameLabel(record.new_name as Parameters<typeof getScientificNameLabel>[0]) ||
    String(record.new_name___scientific_name ?? '');
  const nameLabel =
    oldName || newName ? `${oldName || 'No old name'} -> ${newName || 'No new name'}` : '';

  return [typeLabel, nameLabel].filter(Boolean).join(': ');
};

const CreatePublicationButton = () => {
  const form = useFormContext();

  return (
    <EnterpriseDialogThemeProvider>
      <CreateInDialogButton
        resource="publications"
        fullWidth
        maxWidth="lg"
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
        <div className="px-4 py-2 sm:px-6">
          <PublicationForm />
        </div>
      </CreateInDialogButton>
    </EnterpriseDialogThemeProvider>
  );
};

const TaxonPublicationForm = ({
  hideTaxonName = false,
  hideCrossReference = true,
  hidePublication = false,
}: TaxonPublicationFormProps) => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-5xl gap-4 md:grid-cols-2">
      {!hideTaxonName && !hideCrossReference ? (
        <p className="md:col-span-2 text-sm text-muted-foreground">
          Link this publication reference to either a taxon name or a cross
          reference.
        </p>
      ) : null}
      {!hideTaxonName ? (
        <div className="md:col-span-2">
          <ReferenceInput
            source="taxon_name_id"
            reference="taxon_names"
            sort={{ field: 'canonical_name', order: 'ASC' }}
            perPage={200}
          >
            <AutocompleteInput
              label="Taxon name"
              optionText="scientific_name"
              validate={hideCrossReference ? requiredValue : undefined}
            />
          </ReferenceInput>
        </div>
      ) : null}
      {!hideCrossReference ? (
        <div className="md:col-span-2">
          <ReferenceInput
            source="cross_reference_id"
            reference="cross_references"
            sort={{ field: 'cross_reference_id', order: 'ASC' }}
            perPage={200}
          >
            <AutocompleteInput
              label="Cross reference"
              optionText={formatCrossReferenceOption}
              inputText={formatCrossReferenceOption}
              validate={hideTaxonName ? requiredValue : undefined}
            />
          </ReferenceInput>
        </div>
      ) : null}
      {!hidePublication ? (
        <div className="space-y-2 md:col-span-2">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <ReferenceInput
              source="publication_id"
              reference="publications"
              sort={{ field: 'abbreviated_title', order: 'ASC' }}
              perPage={200}
            >
              <AutocompleteInput
                label="Publication"
                optionText="display_title"
                validate={requiredValue}
              />
            </ReferenceInput>
            <div className="flex items-end md:pb-0.5">
              <CreatePublicationButton />
            </div>
          </div>
        </div>
      ) : null}
      <TextInput source="page_reference" label="Page reference" />
      <TextInput source="figure_reference" label="Figure reference" />
      <div className="md:col-span-2">
        <TextInput source="notes" label="Notes" multiline />
      </div>
    </div>
  </SimpleForm>
);

export default TaxonPublicationForm;
