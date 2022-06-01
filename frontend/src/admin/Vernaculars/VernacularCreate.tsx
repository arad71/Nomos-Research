import React, { FC } from 'react';
import { Create, useNotify, useRedirect, useRefresh } from 'react-admin';
import Aside from '../shared/Aside';
import { VernacularCreateEdit } from './VernacularCreateEdit';

export const VernacularCreate: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Vernacular created`);
    redirect('/vernaculars?sort=updated_on&order=DESC');
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
      <VernacularCreateEdit />
    </Create>
  );
};
