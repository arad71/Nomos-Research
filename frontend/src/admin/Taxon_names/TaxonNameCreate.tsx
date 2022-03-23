import React, { FC } from 'react';
import { Create } from 'react-admin';
import { TaxonNameCreateEdit } from './TaxonNameCreateEdit';

export const TaxonNameCreate: FC = (props) => {
  return (
    <Create {...props}>
      <TaxonNameCreateEdit />
    </Create>
  );
};
