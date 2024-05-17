import React, { FC } from 'react';
import { Create } from 'react-admin';
import { TaxonNameCodeCreateEdit } from './TaxonNameCodeCreateEdit';

export const TaxonNameCodeCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
       <TaxonNameCodeCreateEdit />
    </Create>
  );
};
