import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { KingdomCreateEdit } from './KingdomCreateEdit';

export const KingdomEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <KingdomCreateEdit />
  </Edit>
);
