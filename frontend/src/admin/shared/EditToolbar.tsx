import React, { FC } from 'react';
import { DeleteButton, SaveButton, Toolbar } from 'react-admin';
import { WithPermissions } from '@react-admin/ra-rbac';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  customToolbar: {
    justifyContent: 'space-between',
  },
}));

const EditToolbar = (props: { resource: string }) => {
  const classes = useStyles();
  return (
    <Toolbar className={classes.customToolbar} {...props}>
      {/* @ts-ignore */}
      <SaveButton disabled={props.pristine} />
      <WithPermissions resource={props.resource} action="delete">
        <DeleteButton />
      </WithPermissions>
    </Toolbar>
  );
};

export default EditToolbar;
