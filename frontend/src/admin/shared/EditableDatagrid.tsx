import React from 'react';
// eslint-disable-next-line max-len
import { EditableDatagrid as RaEditableDatagrid } from '@react-admin/ra-editable-datagrid';

export const EditableDatagrid = (
  props: React.PropsWithChildren<Record<string, unknown>>
) => {
  const Component: React.ElementType = RaEditableDatagrid;
  return <Component {...props} />;
};
