import React, { FC } from 'react';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { CrossReferenceShowLayout } from './CrossReferenceShowLayout';

export const CrossReferenceShow: FC = (props) => {
  return (
    <Show {...props} aside={<Aside />} title="Related name">
      <CrossReferenceShowLayout />
    </Show>
  );
};
