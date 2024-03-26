import React, { FC } from 'react';
import { Create } from 'react-admin';
import { ConservationCodesCreateEdit } from './ConservationCodesCreateEdit';

export const ConservationCodesCreate: FC = (props) => {
  return (
    <Create {...props} mutationMode="pessimistic">
      <ConservationCodesCreateEdit />
    </Create>
  );
};
