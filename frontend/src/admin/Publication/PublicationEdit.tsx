import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { PublicationCreateEdit } from './PublicationCreateEdit';

export const PublicationEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props} aside={<Aside />}>
      <PublicationCreateEdit />
    </Edit>
  );
};
