import React, { FC } from 'react';
import { useNotify, useRefresh, useRedirect, Create } from 'react-admin';
import { ConscodeTaxonCreateEdit } from './ConscodeTaxonCreateEdit';

export const ConscodeTaxonCreate: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const onSuccess = (data: any) => {
    // console.log(JSON.stringify(data));
    // console.log(data.data.taxon_name_id);
    notify(`Changes saved`);
    redirect(`/taxon_names_code/${data.data.taxon_name_id}`);
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
