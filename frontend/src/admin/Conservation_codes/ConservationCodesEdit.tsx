import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { ConservationCodesCreateEdit } from './ConservationCodesCreateEdit';
import { ConservationDescription } from './ConservationDescription';

export const ConservationCodesEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title={<ConservationDescription />}
    >
      <ConservationCodesCreateEdit />
    </Edit>
  );
};
