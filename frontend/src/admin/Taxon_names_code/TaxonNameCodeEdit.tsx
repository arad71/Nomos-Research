import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import PostEditActions from '../shared/PostEditActions';
import { TaxonNameCodeCreateEdit } from './TaxonNameCodeCreateEdit';
// eslint-disable-next-line max-len
import { FormattedScientificNameWithStatus } from '../Taxon_names/FormattedScientificNameWithStatus';

export const TaxonNameCodeEdit: FC = (props) => {
  return (
    <Edit
      actions={<PostEditActions />}
      aside={<Aside />}
      title={<FormattedScientificNameWithStatus />}
      mutationMode="pessimistic"
      {...props}
    >
      <TaxonNameCodeCreateEdit />
    </Edit>
  );
};
