import { WithPermissions } from '@react-admin/ra-rbac';
import { useResourceContext } from 'react-admin';
import {
  DeleteWithConfirmIconButton,
  EditRowButton,
} from '@react-admin/ra-editable-datagrid';
import React from 'react';

const CustomAction = () => (
  <>
    <WithPermissions action="edit" resource={useResourceContext()}>
      <EditRowButton />
    </WithPermissions>
    <WithPermissions action="delete" resource={useResourceContext()}>
      <DeleteWithConfirmIconButton mutationMode="undoable" />
    </WithPermissions>
  </>
);

export default CustomAction;
