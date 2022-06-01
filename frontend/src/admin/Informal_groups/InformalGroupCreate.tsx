import React, { FC } from 'react';
import { Create, useNotify, useRedirect, useRefresh } from 'react-admin';
import { InformalGroupCreateEdit } from './InformalGroupCreateEdit';

export const InformalGroupCreate: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Informal Group created`);
    redirect('/informal_groups?sort=updated_on&order=DESC');
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
      <InformalGroupCreateEdit />
    </Create>
  );
};
