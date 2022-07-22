import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { VernacularCreateEdit } from './VernacularCreateEdit';
import { VernacularName } from './VernacularName';

export const VernacularEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      title={<VernacularName />}
      aside={<Aside />}
    >
      <VernacularCreateEdit />
    </Edit>
  );
};
