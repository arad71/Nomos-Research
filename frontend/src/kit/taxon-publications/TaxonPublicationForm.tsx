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
  hidePublication = false,
}: TaxonPublicationFormProps) => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-5xl gap-4 md:grid-cols-2">
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
              validate={requiredValue}
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
