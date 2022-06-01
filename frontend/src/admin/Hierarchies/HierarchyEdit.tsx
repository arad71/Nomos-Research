import React, { FC } from 'react';
import { Edit, useNotify, useRedirect, useRefresh } from 'react-admin';
import Aside from '../shared/Aside';
import { HierarchyCreateEdit } from './HierarchyCreateEdit';

export const HierarchyEdit: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Hierarchy updated`);
    redirect('/hierarchies?sort=updated_on&order=DESC');
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
      <HierarchyCreateEdit />
    </Edit>
  );
};
