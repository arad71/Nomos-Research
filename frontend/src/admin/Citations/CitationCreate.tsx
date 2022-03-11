import React, { FC } from 'react';
import { Create } from 'react-admin';
import {CitationCreateEdit} from "./CitationCreateEdit";

export const CitationCreate: FC = (props) => (
  <Create {...props}>
    <CitationCreateEdit />
  </Create>
);
