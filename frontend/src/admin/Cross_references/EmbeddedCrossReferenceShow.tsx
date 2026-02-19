import React, { FC } from 'react';
import { Show } from 'react-admin';
import { CrossReferenceShowLayout } from './CrossReferenceShowLayout';

export const EmbeddedCrossReferenceShow: FC = (props) => (
  <Show {...props} title=" ">
    <CrossReferenceShowLayout />
  </Show>
);
