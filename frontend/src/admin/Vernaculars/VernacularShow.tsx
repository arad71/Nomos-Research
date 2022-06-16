import React, { FC } from 'react';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { VernacularShowLayout } from '../Vernaculars';

export const VernacularShow: FC = (props) => {
  return (
    <Show {...props} aside={<Aside />}>
      <VernacularShowLayout />
    </Show>
  );
};
