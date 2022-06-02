import React, { FC } from 'react';
import { Edit } from 'react-admin';
import { TaxonRankCreateEdit } from './TaxonRankCreateEdit';

export const TaxonRankEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props}>
      <TaxonRankCreateEdit />
    </Edit>
  );
};
