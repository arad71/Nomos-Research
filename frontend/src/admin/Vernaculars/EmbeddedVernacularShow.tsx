import React, { FC } from 'react';
import { Show } from '@react-admin/ra-rbac';
import { VernacularShowLayout } from './VernacularShowLayout';

export const EmbeddedVernacularShow: FC = (props) => (
  <Show {...props} title=" ">
    <VernacularShowLayout />
  </Show>
);
