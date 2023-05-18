import React, { FC } from 'react';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { HierarchyShowLayout } from './HierarchyShowLayout';

export const HierarchyShow: FC = (props) => {
  return (
    <Show aside={<Aside />} title="Hierarchy" {...props}>
      <HierarchyShowLayout />
    </Show>
  );
};
