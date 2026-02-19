import React, { FC } from 'react';
import { Edit } from 'react-admin';
import { TaxonRankCreateEdit } from './TaxonRankCreateEdit';
import { RankName } from './RankName';

export const TaxonRankEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props} title={<RankName />}>
      <TaxonRankCreateEdit />
    </Edit>
  );
};
