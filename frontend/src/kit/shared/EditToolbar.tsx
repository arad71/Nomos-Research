import React from 'react';
import { DeleteWithConfirmButton, SaveButton, Toolbar } from 'react-admin';
import { CanAccess as IfCanAccess } from 'react-admin';
import makeStyles from 'lib/makeStyles';
import { useRecordContext } from 'react-admin';

const useStyles = makeStyles((theme: any) => ({
  customToolbar: {
    justifyContent: 'space-between',
  },
  actionGroup: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
  },
}));

const EditToolbar = (props: { resource: string }) => {
  const classes = useStyles();
  const record = useRecordContext();
  const hasRecordId = Boolean(record && record.id);

  return (
    <Toolbar className={classes.customToolbar} {...props}>
      <div className={classes.actionGroup}>
        {/* @ts-ignore */}
        <SaveButton
          disabled={props.pristine}
          variant="contained"
          label="Save changes"
        />
        {hasRecordId && (
          <IfCanAccess resource={props.resource} action="delete">
            <DeleteWithConfirmButton
              mutationMode="pessimistic"
              variant="outlined"
              label="Delete"
            />
          </IfCanAccess>
        )}
      </div>
    </Toolbar>
  );
};

export default EditToolbar;
