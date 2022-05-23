import React, { FC } from 'react';
import { Edit } from 'react-admin';
import { UserCreateEdit } from './UserCreateEdit';
import Aside from '../shared/Aside';

export const UserEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <UserCreateEdit />
  </Edit>
);
