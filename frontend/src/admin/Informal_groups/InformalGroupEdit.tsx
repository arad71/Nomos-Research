import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { InformalGroupCreateEdit } from './InformalGroupCreateEdit';

export const InformalGroupEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props} aside={<Aside />}>
      <InformalGroupCreateEdit />
    </Edit>
  );
};
