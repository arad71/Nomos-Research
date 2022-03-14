import React, { FC } from 'react';
import { Edit } from 'react-admin';
import {TaxonRankCreateEdit} from "./TaxonRankCreateEdit";

export const TaxonRankEdit: FC = (props) => (
  <Edit {...props}>
    <TaxonRankCreateEdit />
  </Edit>
);
