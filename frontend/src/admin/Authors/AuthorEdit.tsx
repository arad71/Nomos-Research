import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { AuthorCreateEdit } from './AuthorCreateEdit';

export const AuthorEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <AuthorCreateEdit />
  </Edit>
);
