import React, { FC } from 'react';
import { Create } from 'react-admin';
import { ClassSystemCreateEdit } from './ClassSystemCreateEdit';

export const ClassificationSystemCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props}>
      <ClassSystemCreateEdit />
    </Create>
  );
};
