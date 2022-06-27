import React, { FC } from 'react';
import { Edit } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { ClassSystemCreateEdit } from './ClassSystemCreateEdit';
import { ClassificationDescription } from './ClassDesc';

export const ClassificationSystemEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      aside={<Aside />}
      title={<ClassificationDescription />}
    >
      <ClassSystemCreateEdit />
    </Edit>
  );
};
