import React, { FC } from 'react';
import { useNotify, useRefresh, useRedirect, Create } from 'react-admin';
import { ConscodeTaxonCreateEdit } from './ConscodeTaxonCreateEdit';

export const ConscodeTaxonCreate: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const getTaxonNameIdFromSource = (): number | undefined => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source');
    if (!source) {
      return undefined;
    }
    try {
      const parsed = JSON.parse(source);
      const value = parsed?.taxon_name_id;
      return typeof value === 'number' ? value : Number(value);
    } catch (_error) {
      return undefined;
    }
  };
  const onSuccess = (data: any) => {
    const taxonNameId =
      data?.taxon_name_id ??
      data?.data?.taxon_name_id ??
      getTaxonNameIdFromSource();
    notify(`Changes saved`);
    if (taxonNameId) {
      redirect(`/taxon_names_code/${taxonNameId}`);
    } else {
      redirect('/conscode_taxons');
    }
    refresh();
  };
  return (
    <Create
      mutationOptions={{ onSuccess }}
      mutationMode="pessimistic"
      {...props}
    >
      <ConscodeTaxonCreateEdit />
    </Create>
  );
};
