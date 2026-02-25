import React, { FC } from 'react';
import { Edit } from 'react-admin';
import { UserCreateEdit } from './UserCreateEdit';
import Aside from '../shared/Aside';
import { FullName } from './FullName';

export const UserEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title={<FullName />}
    >
      <UserCreateEdit />
    </Edit>
  );
};
