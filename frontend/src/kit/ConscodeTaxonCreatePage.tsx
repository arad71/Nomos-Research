import * as React from 'react';
import { useNotify, useRedirect, useRefresh } from 'ra-core';
import { Create } from '@/components/admin/create';
import ConscodeTaxonForm from './ConscodeTaxonForm';

const getTaxonNameIdFromSource = () => {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  if (!source) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(source);
    const value = parsed?.taxon_name_id;
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string' && value !== '') {
      const numericValue = Number(value);
      return Number.isNaN(numericValue) ? undefined : numericValue;
    }
  } catch (_error) {
    return undefined;
  }

  return undefined;
};

const ConscodeTaxonCreatePage = () => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  return (
    <Create
      resource="conscode_taxons"
      title="Create conservation code - taxon link"
      mutationMode="pessimistic"
      mutationOptions={{
        onSuccess: (data: { taxon_name_id?: number } | { data?: { taxon_name_id?: number } }) => {
          const taxonNameId =
            data?.taxon_name_id ??
            data?.data?.taxon_name_id ??
            getTaxonNameIdFromSource();

          notify('Changes saved');
          if (taxonNameId) {
            redirect(`/taxon_names_code/${taxonNameId}`);
          } else {
            redirect('/conscode_taxons');
          }
          refresh();
        },
      }}
    >
      <ConscodeTaxonForm />
    </Create>
  );
};

export default ConscodeTaxonCreatePage;
