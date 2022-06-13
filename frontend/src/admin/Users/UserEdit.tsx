import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import { UserCreateEdit } from './UserCreateEdit';
import Aside from '../shared/Aside';

export const UserEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props} aside={<Aside />}>
      <UserCreateEdit />
    </Edit>
  );
};
