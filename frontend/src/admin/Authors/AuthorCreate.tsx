import React, { FC } from 'react';
import { Create } from 'react-admin';
import { AuthorCreateEdit } from './AuthorCreateEdit';

export const AuthorCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <AuthorCreateEdit />
    </Create>
  );
};
