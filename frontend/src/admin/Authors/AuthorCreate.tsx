import React, { FC } from 'react';
import { Create } from 'react-admin';
import {AuthorCreateEdit} from "./AuthorCreateEdit";

export const AuthorCreate: FC = (props) => (
  <Create {...props}>
    <AuthorCreateEdit />
  </Create>
);
