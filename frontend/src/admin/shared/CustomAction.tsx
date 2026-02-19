import { IfCanAccess } from '@react-admin/ra-rbac';
import { useResourceContext } from 'react-admin';
import {
  DeleteWithConfirmIconButton,
  EditRowButton,
} from '@react-admin/ra-editable-datagrid';
import React from 'react';

const CustomAction = () => (
  <>
    <IfCanAccess action="edit" resource={useResourceContext()}>
      <EditRowButton />
    </IfCanAccess>
    <IfCanAccess action="delete" resource={useResourceContext()}>
      <DeleteWithConfirmIconButton mutationMode="pessimistic" />
    </IfCanAccess>
  </>
);

export default CustomAction;
