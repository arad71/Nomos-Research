import React, { FC } from 'react';
import { Edit } from 'react-admin';
import Aside from '../shared/Aside';
import { PublicationCreateEdit } from './PublicationCreateEdit';
import { DisplayTitle } from './DisplayTitle';
import PostEditActions from '../shared/PostEditActions';

export const PublicationEdit: FC = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      {...props}
      actions={<PostEditActions />}
      aside={<Aside />}
      title={<DisplayTitle />}
    >
      <PublicationCreateEdit />
    </Edit>
  );
};
