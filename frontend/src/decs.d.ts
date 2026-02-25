declare module 'react-admin';

declare module '@react-admin/ra-editable-datagrid' {
  import * as React from 'react';

  export const EditableDatagrid: React.ComponentType<any>;
  export const RowForm: React.ComponentType<any>;
  export const EditRowButton: React.ComponentType<any>;
  export const DeleteWithConfirmIconButton: React.ComponentType<any>;
  export const useRowContext: () => { close: () => void };
  export type RowFormProps = any;
}
