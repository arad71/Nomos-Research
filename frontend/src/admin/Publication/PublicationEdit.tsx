import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { PublicationCreateEdit } from './PublicationCreateEdit';
import { DisplayTitle } from './DisplayTitle';

export const PublicationEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title={<DisplayTitle />}
    >
      <PublicationCreateEdit />
    </Edit>
  );
};
