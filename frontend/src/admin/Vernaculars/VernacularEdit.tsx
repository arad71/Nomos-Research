import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { VernacularCreateEdit } from './VernacularCreateEdit';

export const VernacularEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props} aside={<Aside />}>
      <VernacularCreateEdit />
    </Edit>
  );
};
