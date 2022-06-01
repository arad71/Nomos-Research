import React, { FC } from 'react';
import { Edit, useNotify, useRedirect, useRefresh } from 'react-admin';
import Aside from '../shared/Aside';
import { InformalGroupCreateEdit } from './InformalGroupCreateEdit';

export const InformalGroupEdit: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Informal Group updated`);
    redirect('/informal_groups?sort=updated_on&order=DESC');
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
      <InformalGroupCreateEdit />
    </Edit>
  );
};
