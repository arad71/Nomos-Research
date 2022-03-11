import React, { FC } from 'react';
import { Create } from 'react-admin';
import {InformalGroupCreateEdit} from "./InformalGroupCreateEdit";

export const InformalGroupCreate: FC = (props) => (
  <Create {...props}>
    <InformalGroupCreateEdit />
  </Create>
);
