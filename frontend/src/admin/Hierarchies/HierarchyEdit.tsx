import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { HierarchyCreateEdit } from './HierarchyCreateEdit';

export const HierarchyEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props} aside={<Aside />}>
      <HierarchyCreateEdit />
    </Edit>
  );
};
