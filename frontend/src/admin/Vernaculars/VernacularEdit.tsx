import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import {VernacularCreateEdit} from "./VernacularCreateEdit";

export const VernacularEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <VernacularCreateEdit />
  </Edit>
);
