import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { PublicationCreateEdit } from './PublicationCreateEdit';

export const PublicationEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <PublicationCreateEdit />
  </Edit>
);
