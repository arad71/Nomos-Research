import React, { FC } from 'react';
import { Edit, useNotify, useRedirect, useRefresh } from 'react-admin';
import Aside from '../shared/Aside';
import { ClassSystemCreateEdit } from './ClassSystemCreateEdit';

export const ClassificationSystemEdit: FC = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleSuccess = () => {
    notify(`Classification Type updated`);
    redirect('/classification_systems?sort=updated_on&order=DESC');
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
      <ClassSystemCreateEdit />
    </Edit>
  );
};
