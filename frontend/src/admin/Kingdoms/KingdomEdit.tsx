import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { KingdomCreateEdit } from './KingdomCreateEdit';
import { KingdomName } from './KingdomName';

export const KingdomEdit: FC = (props) => (
  <Edit
    {...props}
    mutationMode="pessimistic"
    aside={<Aside />}
    title={<KingdomName />}
  >
    <KingdomCreateEdit />
  </Edit>
);
