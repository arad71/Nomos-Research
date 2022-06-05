import React, { FC } from 'react';
import { Show } from '@react-admin/ra-rbac';
import { CrossReferenceShowLayout } from './CrossReferenceShowLayout';

export const EmbeddedCrossReferenceShow: FC = (props) => (
  <Show {...props} title=" ">
    <CrossReferenceShowLayout />
  </Show>
);
