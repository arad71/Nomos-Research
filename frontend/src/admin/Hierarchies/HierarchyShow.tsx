import React, { FC } from 'react';
import { Show } from 'react-admin';
import Aside from '../../kit/shared/Aside';
import { HierarchyShowLayout } from './HierarchyShowLayout';

export const HierarchyShow: FC = (props) => {
  return (
    <Show aside={<Aside />} title="Hierarchy" {...props}>
      <HierarchyShowLayout />
    </Show>
  );
};
