import React, { FC } from 'react';
import { Create } from 'react-admin';
import Aside from '../shared/Aside';
import { VernacularCreateEdit } from './VernacularCreateEdit';

export const VernacularCreate: FC = (props) => {
  return (
    <Create mutationMode="pessimistic" {...props} aside={<Aside />}>
      <VernacularCreateEdit />
    </Create>
  );
};
