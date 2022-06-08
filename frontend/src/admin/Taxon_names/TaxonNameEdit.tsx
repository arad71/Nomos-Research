import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { TaxonNameCreateEdit } from './TaxonNameCreateEdit';

export const TaxonNameEdit: FC = (props) => {
  return (
    <Edit aside={<Aside />} mutationMode="pessimistic" {...props}>
      <TaxonNameCreateEdit />
    </Edit>
  );
};
