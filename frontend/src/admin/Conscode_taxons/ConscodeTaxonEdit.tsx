import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import { useNotify, useRefresh, useRedirect } from 'react-admin';
import Aside from '../shared/Aside';
import { ConscodeTaxonCreateEdit } from './ConscodeTaxonCreateEdit';

export const ConscodeTaxonEdit: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const onSuccess = (data: any) => {
    notify(`Changes saved`);
    redirect(`/taxon_names_code/${data.data.taxon_name_id}`);
    refresh();
  };

  return (
    <Edit
      onSuccess={onSuccess}
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title="Conservation Code - Taxon relation"
    >
      <ConscodeTaxonCreateEdit />
    </Edit>
  );
};
