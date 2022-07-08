import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import PostEditActions from '../shared/PostEditActions';
import { TaxonNameCreateEdit } from './TaxonNameCreateEdit';
// eslint-disable-next-line max-len
import { FormattedScientificNameWithStatus } from './FormattedScientificNameWithStatus';

export const TaxonNameEdit: FC = (props) => {
  return (
    <Edit
      actions={<PostEditActions />}
      aside={<Aside />}
      title={<FormattedScientificNameWithStatus />}
      mutationMode="pessimistic"
      {...props}
    >
      <TaxonNameCreateEdit />
    </Edit>
  );
};
