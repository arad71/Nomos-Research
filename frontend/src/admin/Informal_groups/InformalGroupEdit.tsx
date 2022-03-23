import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { InformalGroupCreateEdit } from './InformalGroupCreateEdit';

export const InformalGroupEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <InformalGroupCreateEdit />
  </Edit>
);
