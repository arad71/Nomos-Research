import React, { FC } from 'react';
import { DeleteWithConfirmButton, SaveButton, Toolbar } from 'react-admin';
import { CanAccess as IfCanAccess } from 'react-admin';
import makeStyles from 'lib/makeStyles';
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
