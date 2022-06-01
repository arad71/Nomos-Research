import React, { FC } from 'react';
import { Edit, useNotify, useRedirect, useRefresh } from 'react-admin';
import Aside from '../shared/Aside';
import { PublicationCreateEdit } from './PublicationCreateEdit';

export const PublicationEdit: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Publication updated`);
    redirect('/publications?sort=updated_on&order=DESC');
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
      <PublicationCreateEdit />
    </Edit>
  );
};
