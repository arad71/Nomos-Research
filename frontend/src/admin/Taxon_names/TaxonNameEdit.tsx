import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import {TaxonNameCreateEdit} from "./TaxonNameCreateEdit";

export const TaxonNameEdit: FC = (props) => (
  <Edit aside={<Aside />} {...props}>
    <TaxonNameCreateEdit />
  </Edit>
);
