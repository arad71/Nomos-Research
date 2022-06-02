import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { ClassSystemCreateEdit } from './ClassSystemCreateEdit';

export const ClassificationSystemEdit: FC = (props) => {
  return (
    <Edit mutationMode="pessimistic" {...props} aside={<Aside />}>
      <ClassSystemCreateEdit />
    </Edit>
  );
};
