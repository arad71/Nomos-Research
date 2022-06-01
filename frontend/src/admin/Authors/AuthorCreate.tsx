import React, { FC } from 'react';
import { Create, useNotify, useRedirect, useRefresh } from 'react-admin';
import { AuthorCreateEdit } from './AuthorCreateEdit';
import Aside from '../shared/Aside';

export const AuthorCreate: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Author created`);
    redirect('/authors');
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
      aside={<Aside />}
    >
      <AuthorCreateEdit />
    </Create>
  );
};
