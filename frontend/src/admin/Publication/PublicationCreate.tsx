import React, { FC } from 'react';
import { Create } from 'react-admin';
import {PublicationCreateEdit} from "./PublicationCreateEdit";

export const PublicationCreate: FC = (props) => (
  <Create {...props}>
    <PublicationCreateEdit />
  </Create>
);
