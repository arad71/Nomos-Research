import React, { FC } from 'react';
import { Edit } from 'react-admin';
import { useNotify, useRefresh, useRedirect } from 'react-admin';
import Aside from '../shared/Aside';
import { ConscodeTaxonCreateEdit } from './ConscodeTaxonCreateEdit';

export const ConscodeTaxonEdit: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const onSuccess = (data: any) => {
    const taxonNameId = data?.taxon_name_id ?? data?.data?.taxon_name_id;
    notify(`Changes saved`);
    if (taxonNameId) {
      redirect(`/taxon_names_code/${taxonNameId}`);
    } else {
      redirect('/conscode_taxons');
    }
    refresh();
  };

  return (
    <Edit
      mutationOptions={{ onSuccess }}
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title="Conservation Code - Taxon relation"
    >
      <ConscodeTaxonCreateEdit />
    </Edit>
  );
};
