import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { CrossRefCreateEdit } from './CrossRefCreateEdit';

export const CrossReferenceEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title="Related name"
    >
      <CrossRefCreateEdit />
    </Edit>
  );
};
