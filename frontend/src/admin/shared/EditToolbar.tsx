import React, { FC } from 'react';
import { DeleteWithConfirmButton, SaveButton, Toolbar } from 'react-admin';
import { IfCanAccess } from '@react-admin/ra-rbac';
import makeStyles from '@mui/styles/makeStyles';
import { useRecordContext } from 'react-admin';

const useStyles = makeStyles((theme: any) => ({
  customToolbar: {
    justifyContent: 'space-between',
  },
}));

const EditToolbar = (props: { resource: string }) => {
  const classes = useStyles();
  const record = useRecordContext();
  const hasRecordId = Boolean(record && record.id);
  return (
    <Toolbar className={classes.customToolbar} {...props}>
      {/* @ts-ignore */}
      <SaveButton disabled={props.pristine} />
      {hasRecordId && (
        <IfCanAccess resource={props.resource} action="delete">
          <DeleteWithConfirmButton mutationMode="pessimistic" />
        </IfCanAccess>
      )}
    </Toolbar>
  );
};

export default EditToolbar;
