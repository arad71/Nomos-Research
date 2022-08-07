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
      <DeleteWithConfirmIconButton mutationMode="pessimistic" />
    </WithPermissions>
  </>
);

export default CustomAction;
