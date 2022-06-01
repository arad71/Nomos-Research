import React, { FC } from 'react';
import { Edit, useNotify, useRedirect, useRefresh } from 'react-admin';
import Aside from '../shared/Aside';
import { CrossRefCreateEdit } from './CrossRefCreateEdit';

export const CrossReferenceEdit: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Cross Reference updated`);
    redirect('/cross_references?sort=updated_on&order=DESC');
    refresh();
  };

  const handleFailure = (error: any) => {
    notify(error.message, 'warning');
    refresh();
  };

  return (
    <Edit
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
    >
      <CrossRefCreateEdit />
    </Edit>
  );
};
