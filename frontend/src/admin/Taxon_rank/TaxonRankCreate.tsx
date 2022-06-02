import React, { FC } from 'react';
import { Create } from 'react-admin';
import { TaxonRankCreateEdit } from './TaxonRankCreateEdit';

export const TaxonRankCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <TaxonRankCreateEdit />
    </Create>
  );
};
