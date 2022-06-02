import React, { FC } from 'react';
import { Create } from 'react-admin';
import { CrossRefCreateEdit } from './CrossRefCreateEdit';

export const CrossReferenceCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <CrossRefCreateEdit />
    </Create>
  );
};
