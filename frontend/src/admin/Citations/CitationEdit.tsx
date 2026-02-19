import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { CitationCreateEdit } from './CitationCreateEdit';

export const CitationEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title="Citation"
    >
      <CitationCreateEdit />
    </Edit>
  );
};
