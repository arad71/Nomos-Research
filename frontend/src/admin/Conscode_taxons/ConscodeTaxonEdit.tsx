import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { ConscodeTaxonCreateEdit } from './ConscodeTaxonCreateEdit';

export const ConscodeTaxonEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title="Conservation Code - Taxon relation"
    >
      <ConscodeTaxonCreateEdit />
    </Edit>
  );
};
