import React, { FC } from 'react';
import { Create, useNotify, useRedirect, useRefresh } from 'react-admin';
import { PublicationCreateEdit } from './PublicationCreateEdit';

export const PublicationCreate: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Publication created`);
    redirect('/publications?sort=updated_on&order=DESC');
    refresh();
  };

  const handleFailure = (error: any) => {
    notify(error.message, 'warning');
    refresh();
  };

  return (
    <Create
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      mutationMode="pessimistic"
      {...props}
    >
      <PublicationCreateEdit />
    </Create>
  );
};
