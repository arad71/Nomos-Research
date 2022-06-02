import React, { FC } from 'react';
import { Create } from 'react-admin';
import { CitationCreateEdit } from './CitationCreateEdit';

export const CitationCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <CitationCreateEdit />
    </Create>
  );
};
