import React, { FC } from 'react';
import { Create, useNotify, useRedirect, useRefresh } from 'react-admin';
import { HierarchyCreateEdit } from './HierarchyCreateEdit';

export const HierarchyCreate: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Hierarchy created`);
    redirect('/hierarchies?sort=updated_on&order=DESC');
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
      <HierarchyCreateEdit />
    </Create>
  );
};
