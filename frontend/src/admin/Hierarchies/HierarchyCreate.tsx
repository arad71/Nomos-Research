import React, { FC } from 'react';
import { Create } from 'react-admin';
import { HierarchyCreateEdit } from './HierarchyCreateEdit';

export const HierarchyCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <HierarchyCreateEdit />
    </Create>
  );
};
