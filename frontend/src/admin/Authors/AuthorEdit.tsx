import React, { FC } from 'react';
import Aside from '../shared/Aside';
import { AuthorCreateEdit } from './AuthorCreateEdit';
import { Edit } from '@react-admin/ra-rbac';

export const AuthorEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props} aside={<Aside />}>
      <AuthorCreateEdit />
    </Edit>
  );
};
