import * as React from 'react';
import { CreateInDialogButton } from '@react-admin/ra-form-layout';
import { ThemeProvider, createTheme } from '@mui/material';
import { minValue, required } from 'ra-core';
import { useFormContext } from 'react-hook-form';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { NumberInput } from '@/components/admin/number-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import AuthorForm from '../authors/AuthorForm';
import AuthorType from '../shared/choices/AuthorType';

const requiredValue = required();
const minZero = minValue(0);

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

type CitationFormProps = {
  hideTaxonName?: boolean;
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

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

const CreateAuthorButton = () => {
  const form = useFormContext();

  return (
    <EnterpriseDialogThemeProvider>
      <CreateInDialogButton
        resource="authors"
        fullWidth
        maxWidth="md"
        title="Create author"
        label="Create author"
        mutationOptions={{
          onSuccess: (data: { id?: string | number; author_id?: string | number }) => {
            const nextAuthorId = data?.author_id ?? data?.id;
            if (nextAuthorId != null) {
              form.setValue('author_id', nextAuthorId, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }
          },
        }}
        ButtonProps={relatedDialogButtonProps}
      >
        <div className="px-4 py-1">
          <AuthorForm />
        </div>
      </CreateInDialogButton>
    </EnterpriseDialogThemeProvider>
  );
};

const CitationForm = ({ hideTaxonName = false }: CitationFormProps) => (
  <SimpleForm className="max-w-none">
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
      {!hideTaxonName ? (
        <div className="md:col-span-2">
          <ReferenceInput
            source="taxon_name_id"
            reference="taxon_names"
            sort={{ field: 'canonical_name', order: 'ASC' }}
            perPage={100}
            filterToQuery={(searchText: string) => ({
              scientific_name__ilike: `%${searchText}%`,
            })}
          >
            <AutocompleteInput
              label="Taxon name"
              optionText="scientific_name"
              validate={requiredValue}
            />
          </ReferenceInput>
        </div>
      ) : null}
      <div className="space-y-2 md:col-span-2">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <ReferenceInput
            source="author_id"
            reference="authors"
            sort={{ field: 'abbreviation', order: 'ASC' }}
            perPage={100}
          >
            <AutocompleteInput
              label="Author"
              optionText="abbreviation"
              validate={requiredValue}
            />
          </ReferenceInput>
          <div className="flex items-end md:pb-0.5">
            <CreateAuthorButton />
          </div>
        </div>
      </div>
      <SelectInput source="author_type" label="Author type" choices={AuthorType} />
      <NumberInput
        source="author_order"
        label="Author order"
        min={0}
        validate={[requiredValue, minZero]}
      />
    </div>
  </SimpleForm>
);

export default CitationForm;
