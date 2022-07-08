import React, { FC } from 'react';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { VernacularShowLayout } from '../Vernaculars';
import { VernacularName } from './VernacularName';

export const VernacularShow: FC = (props) => {
  return (
    <Show {...props} title={<VernacularName />} aside={<Aside />}>
      <VernacularShowLayout />
    </Show>
  );
};
