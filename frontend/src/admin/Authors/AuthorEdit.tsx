import React, { FC } from 'react';
import { useNotify, useRefresh, useRedirect, Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { AuthorCreateEdit } from './AuthorCreateEdit';

export const AuthorEdit: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Author updated`);
    redirect('/authors');
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
      <AuthorCreateEdit />
    </Edit>
  );
};
