import React, { FC } from 'react';
import { Show } from '@react-admin/ra-rbac';
import { HierarchyShowLayout } from './HierarchyShowLayout';

export const EmbeddedHierarchyShow: FC = (props) => (
  <Show {...props} title=" ">
    <HierarchyShowLayout />
  </Show>
);
