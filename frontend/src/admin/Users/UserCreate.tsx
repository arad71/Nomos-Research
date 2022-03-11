import React, { FC } from 'react';
import { Create } from 'react-admin';
import {UserCreateEdit} from "./UserCreateEdit";

export const UserCreate: FC = (props) => (
  <Create {...props}>
    <UserCreateEdit />
  </Create>
);
