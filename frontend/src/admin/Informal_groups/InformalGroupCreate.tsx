import React, { FC } from 'react';
import { Create } from 'react-admin';
import { InformalGroupCreateEdit } from './InformalGroupCreateEdit';

export const InformalGroupCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <InformalGroupCreateEdit />
    </Create>
  );
};
