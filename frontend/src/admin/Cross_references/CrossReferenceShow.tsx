import React, { FC } from 'react';
import { Show } from 'react-admin';
import Aside from '../shared/Aside';
import { CrossReferenceShowLayout } from './CrossReferenceShowLayout';

export const CrossReferenceShow: FC = (props) => {
  return (
    <Show {...props} aside={<Aside />}>
      <CrossReferenceShowLayout />
    </Show>
  );
};
