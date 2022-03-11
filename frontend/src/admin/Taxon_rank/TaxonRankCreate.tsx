import React, { FC } from 'react';
import { Create } from 'react-admin';
import {TaxonRankCreateEdit} from "./TaxonRankCreateEdit";

export const TaxonRankCreate: FC = (props) => (
  <Create {...props}>
    <TaxonRankCreateEdit />
  </Create>
);
