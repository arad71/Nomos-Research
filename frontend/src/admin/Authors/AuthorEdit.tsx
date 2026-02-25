import React, { FC } from 'react';
import Aside from '../shared/Aside';
import { AuthorCreateEdit } from './AuthorCreateEdit';
import { Edit } from 'react-admin';
import { DisplayName } from './DisplayName';

export const AuthorEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title={<DisplayName />}
    >
      <AuthorCreateEdit />
    </Edit>
  );
};
