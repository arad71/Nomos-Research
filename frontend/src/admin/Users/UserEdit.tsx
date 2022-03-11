import React, { FC } from 'react';
import { Edit } from 'react-admin';
import {UserCreateEdit} from "./UserCreateEdit";

export const UserEdit: FC = (props) => (
  <Edit {...props}>
    <UserCreateEdit />
  </Edit>
);
