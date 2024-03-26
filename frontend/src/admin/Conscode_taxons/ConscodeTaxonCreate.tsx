import React, { FC } from 'react';
import { Create } from 'react-admin';
import { ConscodeTaxonCreateEdit } from './ConscodeTaxonCreateEdit';

export const ConscodeTaxonCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <ConscodeTaxonCreateEdit />
    </Create>
  );
};
