import React, { FC } from 'react';
import { Create } from 'react-admin';
import { UserCreateEdit } from './UserCreateEdit';

export const UserCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <UserCreateEdit />
    </Create>
  );
};
