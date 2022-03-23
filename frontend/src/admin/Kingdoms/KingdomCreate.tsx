import React, { FC } from 'react';
import { Create } from 'react-admin';
import { KingdomCreateEdit } from './KingdomCreateEdit';

export const KingdomCreate: FC = (props) => {
  return (
    <Create {...props}>
      <KingdomCreateEdit />
    </Create>
  );
};
