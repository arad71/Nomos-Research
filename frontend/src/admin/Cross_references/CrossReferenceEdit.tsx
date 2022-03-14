import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import {CrossRefCreateEdit} from "./CrossRefCreateEdit";

export const CrossReferenceEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <CrossRefCreateEdit />
  </Edit>
);
